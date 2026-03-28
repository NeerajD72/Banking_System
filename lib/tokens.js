import jwt from 'jsonwebtoken'


export const AccessToken=async(userid)=>{
  return jwt.sign({userId:userid},process.env.JWT_ACCESS_SECRET,{expiresIn:process.env.JWT_ACCESS_EXPIRY})
}

export const RefreshToken=async(userid)=>{
  return jwt.sign({userId:userid},process.env.JWT_REFRESH_SECRET,{expiresIn:process.env.JWT_REFRESH_EXPIRY})
}

export const verifyAccessToken=async(token)=>{
  return jwt.verify(token,process.env.JWT_ACCESS_SECRET)
}
export const verifyRefreshToken=async(token)=>{
  return jwt.verify(token,process.env.JWT_REFRESH_SECRET)
}