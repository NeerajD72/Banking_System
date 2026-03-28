import twilio from 'twilio'
import logger from '../config/logger.js'

export const sendSMS=async(to,message)=>{
  if(!process.env.TWILIO_ACCOUNT_SID||!process.env.TWILIO_AUTH_TOKEN||!process.env.TWILIO_PHONE_NUMBER){
    logger.warn('SMS env not available')
    return 
  }

  const client=twilio(process.env.TWILIO_ACCOUNT_SID,process.env.TWILIO_AUTH_TOKEN)

  try{
    await client.messages.create({
    body:message,
    from:process.env.TWILIO_PHONE_NUMBER,
    to
  })
  }catch(error){
    logger.error(error)
  }
}