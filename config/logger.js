import winston from 'winston'


const logger=winston.createLogger({
  //what level of mesg to record this is an info type so level info
  level:'info',
  //how to from the msg
  format:winston.format.combine(
    winston.format.timestamp(), //adds time to each log
    winston.format.json() //saves as json fromat
  ),

  //where to save logs
  transports:[
    //errors got to error.log file
    new winston.transports.File({
      filename:'logs/error.log',
      level:'error'
    }),

    //everything goes to combined.log
    new winston.transports.File({
      filename:'logs/combined.log',
    })
  ]
})

//in devlopment also show interminal
if(process.env.NODE_ENV !== 'production'){
  logger.add(
    new winston.transports.Console({
      format:winston.format.simple()
    })
  )
}


export default logger