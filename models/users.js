import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt, { genSalt } from "bcrypt";
const userSchema = mongoose.Schema({
  name: {
    type: String,
    require: true,
  },

  email: {
    type: String,
    require: true,
    unique: true,
  },
  password: {
    type: String,
    require: true,
    minlength: [8, "Password must be at least 8 character long"],
    select: false, // select false is passig because for security reason  an ensure that password will not include
  },
  avatar: {
    public_id: String,
    url: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  task: [
    {
      title: String,
      description: String,
      completed: Boolean,
      createdAt: Date,
    },
  ],
  verified: {
    type: Boolean,
    default: false,
  },
  otp: Number,
  otp_expire: Date,
  resetPasswordOTP : Number,
  resetPasswordOtpExpire : Date,
  
});

// PASSWORD HASHING
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    console.log(error);
  }
});

// FOR THIS WE RECIVED TOKEN
userSchema.methods.getJWTtoken = function () {
  return jwt.sign({ _id: this.id }, process.env.JWT_SECREAT_KEY, {
    expiresIn: process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000,
  });
};

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// TTL IN MONGOD ITS IS AN INDEX WHERE ITS DELETE A SPECIFIC ITEM A SPECIFIC TIME YANI KI KUCH TIME BAAD DATADELETE HOJAYEGA
userSchema.index({ otp_expire: 1 }, { expireAfterSeconds: 0 }); // otp expire hote he use ka data delete kr do with 0 second
export const User = mongoose.model("User", userSchema);
