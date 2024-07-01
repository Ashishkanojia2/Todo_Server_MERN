import { json } from "express";
import { User } from "../models/users.js";
import { sendMail } from "../utils/sendMail.js";
import { sendToken } from "../utils/sendToken.js";
import cloudinary from "cloudinary";

import fs from "fs";
import { log } from "console";

//HOME ROUTE
export const home = async (req, res) => {
  res.send("working node js server");
};

// REGISTER USER ACCOUNT
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    // console.log(email, name, password);

    const avatar = req.files.avatar.tempFilePath;
    // console.log(avatar);

    // FIRST WE CHECK THIS USERNAME IS ALREADY USER IS PRESENT OR NOT
    let user = await User.findOne({ email });
    // console.log(user, "ye rah a already user");
    if (user)
      return res.status(400).json({
        success: false,
        message: "Invalid crenditals --> user already exists",
      });

    // WHILE CREATING USER TO PASSING DATA FROM ROUTER, WE WILL SEND OPT AS WELL AS WITH USER DATA IN DATABASE
    const otp = Math.floor(Math.random() * 1000000);
    const otp_expire = new Date(
      Date.now() + process.env.OTP_EXPIRE * 60 * 1000
    );
    //
    //
    //

    const mycloud = await cloudinary.v2.uploader.upload(avatar, {
      folder: "todoAPP_ashishDev", // FOR THIS IN CLOUDNARY SERVER ONE FOLDER WILL CREATE WITH THIS SAME NAME AND ALL THE PHOTOS WILL SAVE IN THIS FOLDER
    });

    //
    //
    fs.rmSync("./tmp", { recursive: true }); // THIS IS FOR DELETE TEMP IMAGE FOLDER FROM THIS PROJECT(SERVER) FOR SAVE MEMORY LEAKS
    //
    //

    // CREATE USER IF USER IS DOESN'T FIND
    user = await User.create({
      name,
      email,
      password,
      avatar: {
        public_id: mycloud.public_id,
        url: mycloud.secure_url,
      },
      otp,
      otp_expire,
    });
    await sendMail(email, "Verify Your Account", `Your OTP IS ${otp}`);
    sendToken(
      res,
      user,
      200,
      "OTP send to your email , Please verify yor account "
    );
  } catch (error) {
    console.log(
      res.status(500).json({
        success: false,
        message: `Catch Case --> ${error}`,
      })
    );
  }
};

//VERIFY USER  ACCOUNT

export const verify = async (req, res) => {
  try {
    const otp = Number(req.body.otp);
    const user = await User.findById(req.user._id); // Corrected to findById

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    if (user.otp !== otp || user.otp_expire < Date.now()) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid OTP or it has expired" });
    }

    user.verified = true;
    user.otp = null;
    user.otp_expire = null;

    await user.save();
    sendToken(res, user, 200, "Account Verified");
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Catch Case verify --> ${error.message}`,
    });
  }
};

// LOGIN  USER AUTH

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Please enter all fields" });
    }

    // Find the user by email and explicitly include the password field
    const user = await User.findOne({ email }).select("+password");
    console.log(user, "Fetched user with password field");
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials --> User doesn't exist",
      });
    }

    // Compare the provided password with the stored hashed password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials --> Password doesn't match",
      });
    }

    // If password matches, send token for successful login
    sendToken(res, user, 200, "Login Successful");
    // res.status(400).json({ user: user });
  } catch (error) {
    console.log(
      res.status(500).json({
        success: false,
        message: `Catch Case --> ${error.message}`,
      })
    );
  }
};

// LOGOUT USER AUTH

export const logout = async (req, res) => {
  try {
    res
      .status(200)
      .cookie("token", null, {
        expires: new Date(Date.now()),
      })
      .json({ success: true, message: "Logout successfully" });
  } catch (error) {
    console.log(
      res.status(500).json({
        success: false,
        message: `Catch Case --> ${error.message}`,
      })
    );
  }
};

// ADD TO TASK

export const addTaks = async (req, res) => {
  try {
    const { title, description } = req.body;

    const user = await User.findById(req.user._id);
    console.log(`@@@@@@@@@@@ ${user}`);
    user.task.push({
      title,
      description,
      completed: false,
      createdAt: new Date(Date.now()),
    });
    await user.save();
    res
      .status(200)
      .json({ success: true, message: "Task added successfully " });
  } catch (error) {
    console.log(
      res.status(500).json({
        success: false,
        message: `Catch Case --> ${error.message}`,
      })
    );
  }
};

// REMOVE TASK
export const removeTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const user = await User.findById(req.user._id);
    user.task = user.task.filter((task) => task.id !== taskId);

    await user.save();
    res
      .status(200)
      .json({ success: true, message: "Task Remove successfully " });
  } catch (error) {
    console.log(
      res.status(500).json({
        success: false,
        message: `Catch Case --> ${error.message}`,
      })
    );
  }
};

// UPDATE TASK
// export const updateTask = async (req, res) => {
//   try {
//     const { taskId } = req.params;
//     const user = await User.findById(req.user._id);
//     console.log(`update${user}`);

//     user.task = user.task.find(
//       (task) => task._id.toString() === taskId.toString()
//     );

//     user.task.completed = !user.task.completed;

//     await user.save();
//     res
//       .status(200)
//       .json({ success: true, message: "Task update successfully " });
//   } catch (error) {
//     console.log(
//       res.status(500).json({
//         success: false,
//         message: `Catch Case --> ${error.message}`,
//       })
//     );
//   }
// };

export const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const user = await User.findById(req.user._id);

    if (!user) {
      console.log("User not found");
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    console.log("User found:", user);

    // Find the specific task within the user's tasks array
    const task = user.task.id(taskId);

    if (!task) {
      console.log("Task not found");
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }

    console.log("Task found before update:", task);

    // Toggle the completed status of the found task
    task.completed = !task.completed;

    console.log("Task after update:", task);

    await user.save();

    console.log("User saved after task update:", user);

    res
      .status(200)
      .json({ success: true, message: "Task updated successfully" });
  } catch (error) {
    console.log(`Catch Case --> ${error.message}`);
    res.status(500).json({
      success: false,
      message: `Catch Case --> ${error.message}`,
    });
  }
};

// GET MY PROFILE
export const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    sendToken(res, user, 201, `Welcome Back User ${user.name}`);
  } catch (error) {
    console.log(
      res.status(500).json({
        success: false,
        message: `Catch Case --> ${error.message}`,
      })
    );
  }
};

// UPDATE PROFILE
// export const updateProfile = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id);

//     const { name } = req.body;
//     const avatar = req.files.avatar.tempFilePath;
//     if (name) user.name = name;
//     if (avatar) {
//       await cloudinary.v2.uploader.destroy(user.avatar.public_id); // THIS IS FOR DELETE PREVIOUS IMAGE FROM CLOUDINARY
//       const mycloud = await cloudinary.v2.uploader.upload(avatar);

//       //
//       //
//       fs.rmSync("./tmp", { recursive: true }); // THIS IS FOR DELETE TEMP IMAGE FOLDER FROM THIS PROJECT(SERVER) FOR SAVE MEMORY LEAKS
//       //
//       //
//       user.avatar = {
//         /// THIS IS  FOR STORE IMAGE IN DATABASE
//         public_id: mycloud.public_id,
//         url: mycloud.secure_url,
//       };
//     }

//     await user.save();
//     res.status(200).json({ success: true, message: "Profile is Updated" });
//   } catch (error) {
//     console.log(
//       res.status(500).json({
//         success: false,
//         message: `Catch Case --> ${error.message}`,
//       })
//     );
//   }
// };

export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const { name } = req.body;
    const avatar = req.files?.avatar?.tempFilePath;

    if (name) user.name = name;

    if (avatar) {
      try {
        if (user.avatar?.public_id) {
          await cloudinary.v2.uploader.destroy(user.avatar.public_id); // Delete previous image
        }
        const mycloud = await cloudinary.v2.uploader.upload(avatar, {
          folder: "todoAPP_ashishDev", // FOR THIS IN CLOUDNARY SERVER ONE FOLDER WILL CREATE WITH THIS SAME NAME AND ALL THE PHOTOS WILL SAVE IN THIS FOLDER
        });
        user.avatar = {
          public_id: mycloud.public_id,
          url: mycloud.secure_url,
        };

        // Ensure temp file is deleted after upload
        fs.rmSync("./tmp", { recursive: true, force: true });
      } catch (cloudinaryError) {
        console.error("Cloudinary Error:", cloudinaryError);
        return res.status(500).json({
          success: false,
          message: `Cloudinary Error: ${cloudinaryError.message}`,
        });
      }
    }

    await user.save();
    res.status(200).json({ success: true, message: "Profile is Updated" });
  } catch (error) {
    console.error("Catch Case -->", error.message);
    res.status(500).json({
      success: false,
      message: `Catch Case --> ${error.message}`,
    });
  }
};

// UPDATE Password
// export const updatePassword = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id).select("+password");
//     console.log('user me kya mill raha hai' , user);

//     const { oldPassword, newPassword } = req.body;
//     console.log(oldPassword , newPassword);
//     if (!oldPassword || !newPassword) {
//       res.status(400).json({
//         success: false,
//         message: `Please Enter all Field`,
//       });
//     }

//     const isMatch = await user.comparePassword(oldPassword);
//     console.log('value of is match' ,isMatch);

//     if (!isMatch)
//       return res.status(500).json({
//         success: false,
//         message: `Invalid Password password doesn't match`,
//       });
//     user.password = newPassword;

//     await user.save();
//     res.status(200).json({
//       success: true,
//       message: `Password updated Successfully`,
//     });
//   } catch (error) {
//     console.log(
//       res.status(500).json({
//         success: false,
//         message: `Catch Case --> ${error.message}`,
//       })
//     );
//   }
// };
export const updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    // Input validation
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: `Please provide both oldPassword and newPassword.`,
      });
    }

    const user = await User.findById(req.user.id).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User not found.`,
      });
    }

    const isMatch = await user.comparePassword(oldPassword);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: `Current password is incorrect.`,
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Password updated successfully.`,
    });
  } catch (error) {
    console.error("Error in updatePassword:", error);
    res.status(500).json({
      success: false,
      message: `Failed to update password. ${error.message}`,
    });
  }
};

//FORGET PASSWORD
export const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user)
      return res.status(400).json({ success: false, message: "Invalid Email" });

    const otp = Math.floor(Math.random() * 1000000);

    user.resetPasswordOTP = otp;

    user.resetPasswordOtpExpire = Date.now() + 10 * 60 * 1000; // opt valid up to 10 mint

    await user.save();
    await sendMail(
      email,
      "Request for Resetting password ",
      ` here is Your OTP  ${otp}`
    );

    res.status(200).json({
      success: true,
      message: `otp Send  Successfully to ${email}`,
    });
  } catch (error) {
    console.log(
      res.status(500).json({
        success: false,
        message: `Catch Case --> ${error.message}`,
      })
    );
  }
};

//RESETING PASSWORD
export const resetPassword = async (req, res) => {
  try {
    const { otp, newPassword } = req.body;
    const user = await User.findOne({
      resetPasswordOTP: otp,
      resetPasswordOtpExpire: { $gt: Date.now() },
    }).select("+password");

    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "OTP Invalid  or has been Expired" });

    user.resetPasswordOTP = null;
    user.resetPasswordOtpExpire = null;
    user.password = newPassword;

    await user.save();

    res.status(200).json({
      success: true,
      message: `Password change successfully `,
    });
  } catch (error) {
    console.log(
      res.status(500).json({
        success: false,
        message: `Catch Case --> ${error.message}`,
      })
    );
  }
};
