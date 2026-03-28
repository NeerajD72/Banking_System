export const successResponse=(resp,data={},message='success',statuscode=200)=>{
  return resp.status(statuscode).json({success:true,message,data, timestamp: new Date().toISOString()})
}
export const errorResponse=(resp,message='Error',statuscode=400,error=null)=>{
  return resp.status(statuscode).json({success:false,message,error, timestamp: new Date().toISOString()})
}

