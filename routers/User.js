import express from "express";
import {
  addTaks,
  forgetPassword,
  getMyProfile,
  home,
  login,
  logout,
  register,
  removeTask,
  resetPassword,
  updatePassword,
  updateProfile,
  updateTask,
  verify,
} from "../controllers/User.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();

router.route('/home').get(home)

// router.route('/register').post((req, res)=>{})       // asse bee kr skte hai but code clean likhna hai
router.route("/register").post(register);
router.route("/verify").post(isAuthenticated, verify);


router.route("/login").post(login);
router.route("/logout").get(logout);


router.route("/me").get(isAuthenticated , getMyProfile);

//ADD USER TASK
router.route("/newtask").post(isAuthenticated, addTaks);


router.route("/updateprofile").put(isAuthenticated, updateProfile);
router.route("/updatepassword").put(isAuthenticated, updatePassword);


router.route("/forgetpassword").post(forgetPassword);
router.route("/resetPassword").put(resetPassword);




router
  .route("/task/:taskId")
  .get(isAuthenticated, updateTask)
  .delete(isAuthenticated, removeTask);

export default router;
