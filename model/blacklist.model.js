import mongoose from "mongoose";

const blacklistTokenSchema=new mongoose.Schema({
  token:{
    type:String,
    required:true,
    unique:true
  },
},{timestamps:true})

blacklistTokenSchema.index({createdAt:1},{
  expireAfterSeconds:60*60*24*3
})


blacklistTokenSchema.virtual('id').get(function(){
  return this._id.toHexString()
})

blacklistTokenSchema.set('toJSON',{
  virtuals:true
})


const TokenBlacklist=mongoose.model('BlacklistToken',blacklistTokenSchema)

export default TokenBlacklist