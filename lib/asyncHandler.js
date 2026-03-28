
export const asyncHandler=(fn)=>{
  return (req,resp,next)=>{
    return Promise.resolve(fn(req,resp,next)).catch(next)
  }
}