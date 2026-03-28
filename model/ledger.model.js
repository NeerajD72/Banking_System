import mongoose from "mongoose";


const ledgerSchema=new mongoose.Schema({
  account:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Account',
    required:true,
    index:true,
    immutable:true
  },
  amount:{
    type:Number,
    required:true,
    immutable:true
  },
  transaction:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Transaction',
    required:true,
    immutable:true,
    index:true
  },
  type:{
    type:String,
    enum:{
      values:['DEBIT','CREDIT']
    },
    required:true,
    immutable:true
  }
},{timestamps:true})

function preventLedgerModification(){
  throw new Error('Ledger entries are immutable and cannot be modified or deleted')
}

ledgerSchema.pre('findOneAndUpdate',preventLedgerModification)
ledgerSchema.pre('updateOne',preventLedgerModification)
ledgerSchema.pre('deleteOne',preventLedgerModification)
ledgerSchema.pre('remove',preventLedgerModification)
ledgerSchema.pre('deleteMany',preventLedgerModification)
ledgerSchema.pre('updateMany',preventLedgerModification)
ledgerSchema.pre('findOneAndReplace',preventLedgerModification)
ledgerSchema.pre('findOneAndDelete',preventLedgerModification)


ledgerSchema.virtual('id').get( function(){
  return this._id.toHexString()
})

ledgerSchema.set('toJSON',{
  virtuals:true
})


const Ledger=mongoose.model("Ledger",ledgerSchema)
export default Ledger