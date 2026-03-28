import { asyncHandler } from '../lib/asyncHandler.js';
import { errorResponse, successResponse } from '../lib/response.js';
import Account from '../model/account.model.js';
import logger from '../config/logger.js';
//account creating
export const createAccount=asyncHandler(async(req,resp)=>{
  const user=req.user
  const {accountType}=req.body
  if(!accountType){
    return errorResponse(resp,'account type is required for creating an account',400)
  }
  const isExistingAccountType=await Account.findOne({
    user:user.id,
    accountType:accountType
  })
  if(isExistingAccountType){
    return errorResponse(resp,'You already have this account type',409)
  }
  const account=await Account.create({
    user:user.id,
    accountType: accountType
  })
  logger.info('account created')
  return successResponse(resp,{account},'account created',200)
})


//finding multiple account for one user
export const account_list=asyncHandler(async(req,resp)=>{
  const accounts=await Account.find({user: req.user.id})
  if(accounts.length===0){
    return errorResponse(resp,'account not created yet',400)
  }
  return successResponse(resp,{count:accounts.length,accounts:accounts},'user accounts found',200)
})


//finding single account
export const single_account=asyncHandler(async(req,resp)=>{
  const {id}=req.params
  const account=await Account.findOne({_id:id,user:req.user.id})
  if(!account){
    return errorResponse(resp,'account not created yet',400)
  }
  return successResponse(resp,{account:account},'user account found',200)
})

//
export const accountBalance=asyncHandler(async(req,resp)=>{
  const {id}=req.params
  const account=await Account.findOne({
    _id:id,
    user:req.user.id
  })
  if(!account){
    return errorResponse(resp,'account not found',400)
  }
  const balance=await account.getBalance()
  logger.info('balanced fetched success')
  return successResponse(resp,{accountId:account.id,balance:balance},'balance fetched success',200)
})

