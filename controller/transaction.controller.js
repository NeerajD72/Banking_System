import Transaction from "../model/transaction.model.js";
import Ledger from '../model/ledger.model.js'
import Account from "../model/account.model.js";
import mongoose from "mongoose";
import { asyncHandler } from "../lib/asyncHandler.js";
import { errorResponse, successResponse } from "../lib/response.js";
import logger from "../config/logger.js";
import checkFraudRules from '../lib/fraudDetection.js'

// THE 10-STEP TRANSFER FLOW:
// 1: validte request
// 2:validate idempotencyKey
// 3:check account status
// 4:Derive sender balance from ledger
// 5:create transaction (pending)
// 6:create debit legender entry
// 7:create credit ledger entry
// 8:mark transaction (completed)
// 9:commit mongodb session
// 10: send email Notification

export const transferMoney = asyncHandler(async (req, resp) => {
  const { fromAccount, toAccount, amount, idempotencyKey } = req.body;
  if (!idempotencyKey || !fromAccount || !toAccount || !amount) {
    return errorResponse(
      resp,
      "all fields are required to make a transaction",
      400,
    );
  }
  if (fromAccount === toAccount) {
    return errorResponse(resp, "you cannot send money to your own account",400);
  }
  if (amount <= 0) {
    return errorResponse(resp,"you cannot send money because your input amount is invalid",400);
  }

  const isTransactionAlreadyExists = await Transaction.findOne({
    idempotencyKey,
  });
  if (isTransactionAlreadyExists) {
    if (isTransactionAlreadyExists.status === "COMPLETED") {
      return successResponse(
        resp,
        { transaction: isTransactionAlreadyExists },
        "Transaction already processed",
        200,
      );
    }
    if (isTransactionAlreadyExists.status === "PENDING") {
      return errorResponse(resp, "Transaction IS PENDING PLEASE WAIT", 400);
    }
    if (isTransactionAlreadyExists.status === "FAILED") {
      return errorResponse(resp, "Transaction FAILED", 400);
    }
    if (isTransactionAlreadyExists.status === "REVERSED") {
      return errorResponse(resp, "Transaction REVERSED ,PLEASE RETRY", 400);
    }
  }

  const fromUserAccount = await Account.findById(fromAccount);
  const toUserAccount = await Account.findById(toAccount);
  if (!fromUserAccount) {
    return errorResponse(resp, "can not found sender account", 400);
  }
  if (!toUserAccount) {
    return errorResponse(resp, "can not found receiver account", 400);
  }

  if(fromUserAccount.user.toString()!== req.user.id){
    return errorResponse(resp,"Unauthorized access to account", 403)
  }
  if(fromUserAccount.status !=='ACTIVE' || toUserAccount.status!=='ACTIVE'){
    return errorResponse(resp,'both account must be ACTIVE',400)
  }
  const balance=await fromUserAccount.getBalance()
  if(amount>balance){
    return errorResponse(resp,`your input amount is ${amount} but your current balance is ${balance}`,400)
  }

  const violations = await checkFraudRules(
  fromUserAccount,
  toUserAccount,
  amount
)

if (violations.length > 0) {
  return errorResponse(resp, violations[0], 400)
}
  const session = await mongoose.startSession()
  session.startTransaction() 
  
  try{
    const transaction=await Transaction.create([{
      fromAccount:fromUserAccount._id,
      toAccount:toUserAccount._id,
      amount,
      idempotencyKey,
      status:'PENDING'
    }],{session})
    const transactionDoc = transaction[0]

    await Ledger.create([{
      account:fromUserAccount._id,
      amount,
      transaction:transactionDoc._id,
      type:'DEBIT'
    }],{session})

    await Ledger.create([{
      account:toUserAccount._id,
      amount,
      transaction:transactionDoc._id,
      type:'CREDIT'
    }],{session})
    
    await Transaction.findByIdAndUpdate(transactionDoc._id,{status:'COMPLETED'},{session})
    await session.commitTransaction()
    session.endSession()
    logger.info('transaction completed')
    return successResponse(resp,{transaction:transactionDoc},'Transaction completed successfully',200)
  }catch(err){
   await session.abortTransaction()
    session.endSession()
    console.log(err)
    return errorResponse(resp,'Transaction pending due to an error,please try after sometime',500)
  }

});


//if any user deposite cash  in the bank
export const depositMoney = asyncHandler(async (req, res) => {
  const { accountId, amount } = req.body

  // Validate input
  if (!accountId || !amount) {
    return errorResponse(res, "AccountId and amount are required", 400)
  }

  if (amount <= 0) {
    return errorResponse(res, "Amount must be greater than 0", 400)
  }

  // Find account
  const account = await Account.findById(accountId)

  if (!account) {
    return errorResponse(res, "Account not found", 404)
  }

  // Ownership check
  if (account.user.toString() !== req.user.id) {
    return errorResponse(res, "Unauthorized", 403)
  }

  //  Start session
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    //  Create transaction (optional but good practice)
    const txn = await Transaction.create(
      [
        {
          fromAccount: account._id,
          toAccount: account._id,
          amount,
          idempotencyKey: new mongoose.Types.ObjectId().toString(),
          status: "COMPLETED"
        }
      ],
      { session }
    )

    const transactionId = txn[0]._id

    //  CREDIT entry (money added)
    await Ledger.create(
      [
        {
          account: account._id,
          amount,
          transaction: transactionId,
          type: "CREDIT"
        }
      ],
      { session }
    )

    //  Commit
    await session.commitTransaction()
    session.endSession()

    return successResponse(
      res,
      { transaction: txn[0] },
      "Money deposited successfully",
      200
    )
  } catch (err) {
    await session.abortTransaction()
    session.endSession()
      console.log(err)
    return errorResponse(res, "Deposit failed", 500)
  }
})
