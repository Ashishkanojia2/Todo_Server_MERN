import express from "express";
import User from "./routers/User.js";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import cors from "cors";
export const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
    useTempFiles: true, // FOR THIS TEMP FOLDER WILL CREATE AND PHOTO WILL BE STORE ON TEMPEORY BEASES
  })
);

app.use(cors());

app.use("/api/v1", User); // THIS /pi/v1   IS PREFIX MEANS SARI URL SE PHELE YE ALREADY LIKHA HOGA YA LIKHNA HOHA --- V1 IS version first
