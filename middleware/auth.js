// import jwt from "jsonwebtoken";
// import { User } from "../models/users.js";

// export const isAuthenticated = async (req, res, next) => {
//   try {
//     // RECIVE TOKEN FROM COOKIE // TO READ TOKEN WE NEED TO INSTALL COOKIE-PARSER
//     const token = req.cookies;
//     console.log(token);

//     if (!token) {
//       return res
//         .status(500)
//         .json({ success: false, message: "Login First dont recive token " });
//     }

//     const decode = jwt.verify(token, process.env.JWT_SECREAT_KEY);
//     console.log(`ye token ko decode krne ke baad ki value ${decode}`);
//     req.user = await User.findByid(decode._id);
//     next();
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };


import jwt from "jsonwebtoken";
import { User } from "../models/users.js";

export const isAuthenticated = async (req, res, next) => {
  try {
    // RECEIVE TOKEN FROM COOKIE
    const { token } = req.cookies;
    console.log(token);

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Login first. No token received." });
    }

    const decode = jwt.verify(token, process.env.JWT_SECREAT_KEY); // Corrected the typo in SECRET_KEY
    console.log(`Decoded token value: ${JSON.stringify(decode)}`);
    req.user = await User.findById(decode._id);  // Use findById instead of findByid

    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
