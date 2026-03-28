import bcrypt from 'bcrypt'

export const passwordHash=async(password)=>{
  const salt=await bcrypt.genSalt(10)
  const hash=await bcrypt.hash(password,salt)
  return hash
}


export const comparePassword=async(password,passwordHash)=>{
  return bcrypt.compare(password,passwordHash)
}