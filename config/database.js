// import mongoose, { mongo } from "mongoose";

// export const connectDatabase = async () => {
//   try {
//     const { connection } = await mongoose.connect(process.env.MONGO_URI);
//     console.log(`mongoDB connection : ${connection.host}`);
//   } catch (error) {
//     console.log(
//       `THIS ERROR IS COMES FORM DATABASE CONNECTION FROM DATABASE CONNECTION FILE ${error}`
//     );
//     process.exit(1);
//   }
// };


import mongoose from "mongoose";

export const connectDatabase = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error("MONGO_URI is not defined");
    }
    const { connection } = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB connected: ${connection.host}`);
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    process.exit(1);
  }
};
