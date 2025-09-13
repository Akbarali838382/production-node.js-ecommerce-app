import express from "express";
import {
  getUserProfileController,
  loginController,
  logoutController,
  passwordResetController,
  registerController,
  updateProfileController,
  updateProfilePicController,
  updateUserPassword,
  updatePasswordAfterResetController,
  verifyOTPController,
  deleteProfilePicController
} from "../controllers/userController.js";
import { isAuth } from "../middlewares/authMiddleware.js";
import { SingleUpload } from "../middlewares/multer.js";

// router obj
const router = express.Router();

// route
// register
router.post("/register", registerController);

// login
router.post("/login", loginController);

// profile
router.get("/profile", isAuth, getUserProfileController);

// logout
router.get("/logout", isAuth, logoutController);

// update Profile
router.put("/profile-update", isAuth, updateProfileController);

// update password
router.put("/update-password", isAuth, updateUserPassword);

// update profile picture
router.put("/update-picture", isAuth, SingleUpload, updateProfilePicController);
router.delete("/delete-picture", isAuth, deleteProfilePicController); 

// forgot password
router.post('/password-reset',passwordResetController);

// verify password
router.post('/verify-otp',verifyOTPController);

// update password after otp verify
router.post('/update-password-reset',updatePasswordAfterResetController)

// export
export default router;
