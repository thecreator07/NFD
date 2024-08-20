import mongoose from "mongoose";
// import { DB_NAME } from "../constant.js";


const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(process.env.DB_URL,{dbName:"NFDB"});
    console.log(
      `MongoDb Connected !!  DB Host: ${connectionInstance.connection.host}👍`
    );
  } catch (error) {
    console.log("MongoDb connection FALED", error);
    process.exit(1); //forcibly shutdown if error occurs in db connection
  }
};

export default connectDB;
