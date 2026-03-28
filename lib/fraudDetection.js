import Transaction from "../model/transaction.model.js";

export const checkfraudRules=async(fromAccount,toAccount,amount,userId)=>{
  const violations=[]

  if(amount>500000){
    violations.push('Amount exceeds single transaction limit')
  }

  if(fromAccount._id.toString() === toAccount._id.toString()){
    violations.push('Cannot transfer to same account')
  }

  const fiveMinuteRule=new Date(Date.now()-5*60*1000)
  const recentCount=await Transaction.countDocuments({fromAccount:fromAccount._id,createdAt:{$gt:fiveMinuteRule}})
  if(recentCount>=5){
    violations.push('Too many transaction. Please wait five minutes')
  }

  const todayStart=new Date()
  todayStart.setHours(0,0,0,0)

  const dailyTotal=await Transaction.aggregate([
    {$match:{
      fromAccount:fromAccount._id,
      status:'COMPLETED',
      createdAt:{$gt:todayStart}
    }},
    {
      $group: {
      _id: null,
      total: { $sum: '$amount' }
    }
    }
  ])

  const spentToday=dailyTotal[0]?.total || 0
  if(spentToday+amount>1000000){
    violations.push('Daily Transfer limit exceeded')
  }

  const newAccountRule=(Date.now()-fromAccount.createdAt)/(1000*60*60*24)

  if(newAccountRule<7 && amount>30000){
    violations.push('New accounts connot transfer more than 30,000')
  }
  return violations
}