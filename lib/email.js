import sgMail from '@sendgrid/mail'
import logger from '../config/logger.js'

export const sendMail=async({to,subject,html,})=>{
  if(!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_FROM_EMAIL ||!process.env.SENDGRID_FROM_NAME){
    logger.warn('email env are not avilable')
    return
  }

  sgMail.setApiKey(process.env.SENDGRID_API_KEY)

  const message={to,from:{email:process.env.SENDGRID_FROM_EMAIL,name:process.env.SENDGRID_FROM_NAME},subject,html}

  try{
    await sgMail.send(message)
    logger.info('email send success')
  }catch(error){
    logger.error(error)
  }
}