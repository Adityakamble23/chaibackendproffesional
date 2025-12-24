import mongoose from "mongoose";
import { dbname } from "../constants.js";

const connectdb = async () => {
  try {
    const connectionDB = await mongoose.connect(
      `${process.env.MONGO_URI}${dbname}`
    );
    console.log(
      `Database connected successfully: ${connectionDB.connection.host}`
    );
  } catch (error) {
    console.log("Error during server initialization", error);
    process.exit(1);
  }
};

export default connectdb;
