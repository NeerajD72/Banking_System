import User from '../model/user.model.js'
import { asyncHandler } from '../lib/asyncHandler.js'
import { errorResponse } from '../lib/response.js'
const requireRole=asyncHandler(async(req,resp,next)=>{
  const authreq=req.user
  if(!authreq){
    return errorResponse(resp,'you are not system user')
  }
    const user=await User.findById(authreq.id).select("+systemUser")
    if(!user){
      return errorResponse(resp,'you can not access this route because of your role',400)
    }
    if (!user.systemUser) {
    return errorResponse(resp, 'Forbidden: insufficient permissions', 403)
  }
    next()
  
})

export default requireRole