import mongoose from "mongoose";

//here we dont use import because
// This causes circular dependency
// account imports ledger
// ledger imports account
// infinite loop ❌
import Ledger from './ledger.model.js'

const accountSchema=new mongoose.Schema({
  user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User',
    required:true,
    index:true
  },
  accountNumber:{
    type:String,
    unique:true,
    default: () => 'ACC' + Math.floor(100000000 + Math.random() * 900000000)
  },
  status:{
    type:String,
    enum:{
    values:['ACTIVE','FROZEN','CLOSED'],
    message:'Account must be either ACTIVE,FROZEN or CLOSED',
    },
    default:'ACTIVE'
  },
  accountType:{
    type:String,
    enum:{
      values:['SAVINGS','CURRENT','FIXED_DEPOSIT']
    },
    default:'SAVINGS'
  },
  currency:{
    type:String,
    enum:{
      values:[  'INR','USD','EURO']
    },
    default:'INR'
  },
},{timestamps:true})

accountSchema.methods.getBalance=async function() {
  const balanceData=await Ledger.aggregate([
    {$match:{account:this._id}},
    {
      $group:{
        _id:null,
        totalCredit:{
          $sum:{
            $cond:[
              {$eq:["$type","CREDIT"]},
              "$amount",
              0
            ]
          }
        },
        totalDebit:{
          $sum:{
            $cond:[
              {$eq:["$type","DEBIT"]},
              "$amount",
              0
            ]
          }
        }
      }
    },
    {
      $project:{
        _id:0,
        balance:{
          $subtract:['$totalCredit','$totalDebit']
        }
      }
    }
  ])
  if(balanceData.length===0){
    return 0
  }
  return balanceData[0].balance
}
  

accountSchema.index({user:1,status:1})

accountSchema.virtual('id').get(function(){
  return this._id.toHexString()
})

accountSchema.set('toJSON',{
  virtuals:true
})

const account=mongoose.model('Account',accountSchema)
export default account