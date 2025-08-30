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

// forgot password
router.post('/reset-password',passwordResetController)

// export
export default router;
