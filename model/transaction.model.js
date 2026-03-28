import mongoose from "mongoose";

const transactionSchema=new mongoose.Schema({
  fromAccount:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Account',
    required:true,
    index:true
  },
  toAccount:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Account',
    required:true,
    index:true
  },
  status:{
    type:String,
    enum:{values:['PENDING',"COMPLETED","FAILED","REVERSED"]},
    default:'PENDING'
  },
  amount:{
    type:Number,
    required:true,
    min:1
  },
  idempotencyKey:{
    type:String,
    required:true,
    unique:true,
    index:true
  },
  currency:{
    type:String,
    enum:{
      values:[  'INR','USD','EURO']
    },
    default:'INR'
  },
  description: {
  type: String,
  trim: true
}
},{timestamps:true})

transactionSchema.virtual('id').get(function(){
  return this._id.toHexString()
})

transactionSchema.set('toJSON',{
  virtuals:true
})

const transaction=mongoose.model('Transaction',transactionSchema)

export default transaction