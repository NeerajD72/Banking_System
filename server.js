import dotenv from 'dotenv/config'
import {requiredENV} from './config/envValidation.js'
import connection from "./config/database.js";
import app from './app.js'
import logger from './config/logger.js';



requiredENV()
const startServer=async()=>{
  await connection()
  app.listen(process.env.PORT,()=>{
    logger.info(`server listening at ${process.env.PORT}`)
  })
}

startServer().catch(err=>{
  logger.error(err)
  process.exit(1)
})