import mongoose from "mongoose";
import colors from "colors";

const connectedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log(`Mongodb Connected ${mongoose.connection.host}`);
  } catch (error) {
    console.log(`MONGODB Error ${error}`.bgRed.white);
  }
};

export default connectedDB;
