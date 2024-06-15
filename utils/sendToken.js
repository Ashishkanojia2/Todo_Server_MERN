// import { verify } from "jsonwebtoken";

export const sendToken = (res, user, statusCode, message) => {
  // RESPOSNE ME HME SAB KUCH MILL RAHA HAI PASSOWRD BHEE SO HMNE DESTRUCTORE KRKE JOJO BHJ NA HAI TO BJE DENGE
  const userdata = {
    _id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    tasks: user.tasks,
    verified :user.verified
  };
  const token = user.getJWTtoken();

  const options = {
    httpOnly: true,
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
  };
  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({ success: true, message, user: userdata });
};
