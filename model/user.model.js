import mongoose from "mongoose";


const userSchema=new mongoose.Schema({
  name:{
    type:String,
    required:true,
    minLength:3,
    maxLength:20,
    trim:true
  },
  email:{
    type:String,
    required:true,
    unique:true,
    lowercase:true,
    trim:true
  },
  password:{
    type:String,
    required:true,
    minLength:8,
    select:false
  },
  isEmailVerified:{
    type:Boolean,
    default:false
  },
  systemUser:{
    type:Boolean,
    default:false,
    select:false
  },
  resetPasswordToken :{
      type:String,
      select:false
  },
  resetPasswordExpires:{
      type:Date,
      select:false
  },
  otpHash:{
    type:String,
    select:false
  },
  otpExpiry:{
    type:Date,
    select:false
  },
  phone:{
    type:String,
    trim:true
  }
  
},{timestamps:true})


userSchema.virtual('id').get(function(){
  return this._id.toHexString()
})

userSchema.set('toJSON',{
  virtuals:true
})

const User=mongoose.model('User',userSchema)
export default User