import dotenv from 'dotenv/config'

const requiredenvVaribles = [
  'MONGODB_URI',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'JWT_ACCESS_EXPIRY',
  'JWT_REFRESH_EXPIRY',
  'SENDGRID_API_KEY',
  'SENDGRID_FROM_EMAIL',
  'SENDGRID_FROM_NAME',
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN',
  'TWILIO_PHONE_NUMBER',
  'RAZORPAY_KEY_ID',
  'RAZORPAY_KEY_SECRET'
]

export const requiredENV = () => {
  const missingVariables = requiredenvVaribles.filter(varName => !process.env[varName])
  if (missingVariables.length > 0) {
    console.log('missing env variables')
    missingVariables.forEach(varName => { console.log(`missing variables are ${varName}`) })
    process.exit(1)
  }
  console.log('all env are checked no any empty field')
}

