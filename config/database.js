import mongoose from "mongoose";
import dotenv from "dotenv/config";
import logger from './logger.js'
mongoose.connection.on("connected", () => logger.info("connected"));
mongoose.connection.on("open", () =>("open"));
mongoose.connection.on("disconnected", () =>logger.info("disconnected"));
mongoose.connection.on("reconnected", () => logger.info("reconnected"));
mongoose.connection.on("disconnecting", () => logger.info("disconnecting"));
mongoose.connection.on("close", () =>logger.info("close"));

const connection = async () => {
  let attempts = 0;
  const maxRetries = 5;
  while (attempts < maxRetries) {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        //finds the working server for connection
        //if not found server at given timeit fails
        serverSelectionTimeoutMS: 5000,

        // socketTimeoutMS is - how long database waits for a response after sending a request
        // if response takes time connection closed
        socketTimeoutMS: 45000,

        //number of users allow to connect with database
        maxPoolSize: 10,
        retryWrites: true,
      });
      logger.info("database connected");
      return;
    } catch (err) {
      attempts++;
      logger.error("attempted failed");
      if (attempts === maxRetries) {
        logger.warn("try after sometime");
        process.exit(1);
      }
      
        await new Promise(resolve => setTimeout(resolve, 5000));
      
    }
  }
};

export default connection;
