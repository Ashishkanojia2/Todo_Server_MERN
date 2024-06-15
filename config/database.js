import mongoose, { mongo } from "mongoose";

export const connectDatabase = async () => {
  try {
    const { connection } = await mongoose.connect(process.env.MONGO_URI);
    console.log(`mongoDB connection : ${connection.host}`);
  } catch (error) {
    console.log(
      `THIS ERROR IS COMES FORM DATABASE CONNECTION FROM DATABASE CONNECTION FILE ${error}`
    );
    process.exit(1);
  }
};
