import userModal from "../models/userModels.js";
import { getDataUri } from "./../utils/features.js";
import cloudinary from "cloudinary";
import nodemailer from "nodemailer";
import crypto from "crypto";
import bcrypt from "bcryptjs";

// ===============================
//  Email Transporter Config
// ===============================

// create transporter directly
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "akbarali63553745@gmail.com", // your Gmail
    pass: "rivkbtsdvoyhvxqc", // your Gmail App Password
  },
});

// test the connection
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Transporter error:", error);
  } else {
    console.log("✅ Server is ready to send emails");
  }
});


export const registerController = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).send({ success: false, message: "Please provide all fields" });
    }

    const existingUser = await userModal.findOne({ email });
    if (existingUser) {
      return res.status(400).send({ success: false, message: "Email already taken" });
    }

    // Let pre-save hook hash the password
    const user = await userModal.create({ name, email, password });

    const token = user.generateToken();

    res.status(201).send({
      success: true,
      message: "Registration success",
      user,
      token,
    });
  } catch (error) {
    console.error("Register API Error:", error.stack);
    res.status(500).send({
      success: false,
      message: "Error in Register API",
      error: error.message,
    });
  }
};



// login
export const loginController = async (req, res) => {
  try {
    let { email, password } = req.body;

    // Trim email and password to remove extra spaces
    email = email?.trim();
    password = password?.trim();

    // validation
    if (!email || !password) {
      return res.status(400).send({
        success: false,
        message: "Please add email or password",
      });
    }

    // check user
    const user = await userModal.findOne({ email });

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    // check password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(400).send({
        success: false,
        message: "Invalid credentials",
      });
    }

    // generate token
    const token = user.generateToken();

    // set cookie
    res
      .status(200)
      .cookie("token", token, {
        expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
        secure: process.env.NODE_ENV === "production", // only secure in prod
        httpOnly: true, // always httpOnly
        sameSite: "lax",
      })
      .send({
        success: true,
        message: "Login successful",
        token,
        user,
      });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Login API",
      error: error.message,
    });
  }
};


// Get user Profile
export const getUserProfileController = async (req, res) => {
  try {
    const user = await userModal.findById(req.user._id);
    user.password = undefined;
    res.status(200).send({
      success: true,
      message: "User Profile fetch Successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Profile Api",
      error,
    });
  }
};

// logout
export const logoutController = async (req, res) => {
  try {
    res
      .status(200)
      .cookie("token", "", {
        expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        secure: process.env.NODE_ENV === "development" ? true : false,
        httpOnly: process.env.NODE_ENV === "development" ? true : false,
        sameSite: process.env.NODE_ENV === "development" ? true : false,
      })
      .send({
        success: true,
        message: "Logout Successfully",
      });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Logout Api",
      error,
    });
  }
};

// update password
export const updateUserPassword = async (req, res) => {
  try {
    const user = await userModal.findById(req.user._id);
    const { oldPassword, newPassword } = req.body;
    // validation
    if (!oldPassword || !newPassword) {
      return res.status(500).send({
        success: false,
        message: "please enter new or old password",
      });
    }
    // old pass check
    const isMatch = await user.comparePassword(oldPassword);
    // validation
    if (!isMatch) {
      return res.status(500).send({
        success: false,
        message: "inValid Old Password",
      });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.status(200).send({
      success: true,
      message: "password updated successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in updatePassword Api",
      error,
    });
  }
};


export const passwordResetController = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).send({
        success: false,
        message: "Please provide email",
      });
    }

    const user = await userModal.findOne({ email });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    user.resetPasswordOTP = otp;
    user.resetPasswordExpires = otpExpires;
    await user.save();

    // 🔍 Debug your env variables here
    console.log("📧 EMAIL_USER:", process.env.EMAIL_USER);
    console.log(
      "📧 EMAIL_PASS:",
      process.env.EMAIL_PASS ? "Loaded" : "❌ Missing"
    );

    // Send email
    await transporter.sendMail({
      from: `"NexiCart" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP for password reset is: ${otp}. It is valid for 10 minutes.`,
    });

    res.status(200).send({
      success: true,
      message: "OTP sent to your email",
    });
  } catch (error) {
    console.error("Error in passwordResetController:", error.stack);
    res.status(500).send({
      success: false,
      message: "Error in Password Reset API",
      error: error.message,
    });
  }
};


export const verifyOTPController = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).send({
        success: false,
        message: "Please provide email and OTP",
      });
    }

    const user = await userModal.findOne({ email });
    if (
      !user ||
      user.resetPasswordOTP !== otp ||
      user.resetPasswordExpires < Date.now()
    ) {
      return res.status(400).send({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    res.status(200).send({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error("Error in verifyOTPController:", error.stack);
    res.status(500).send({
      success: false,
      message: "Error in OTP Verification API",
      error: error.message,
    });
  }
};

// Update password after OTP verification
export const updatePasswordAfterResetController = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).send({
        success: false,
        message: "Please provide email and new password",
      });
    }

    const user = await userModal.findOne({ email });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    // ✅ Do NOT hash here, let pre-save hook hash it
    user.password = newPassword;

    // Clear OTP fields
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).send({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Error in updatePasswordAfterResetController:", error.stack);
    res.status(500).send({
      success: false,
      message: "Error in Password Update API",
      error: error.message,
    });
  }
};

// Add this new controller to your userController.js file

// Delete user profile photo
export const deleteProfilePicController = async (req, res) => {
  try {
    const user = await userModal.findById(req.user._id);
    
    // Check if user has a profile picture
    if (!user.profilePic || !user.profilePic.public_id) {
      return res.status(400).send({
        success: false,
        message: "No profile picture to delete",
      });
    }

    // Delete image from cloudinary
    await cloudinary.v2.uploader.destroy(user.profilePic.public_id);
    
    // Remove profilePic from user
    user.profilePic = {
      public_id: "",
      url: "",
    };

    // Save user
    await user.save();
    
    res.status(200).send({
      success: true,
      message: "Profile picture deleted successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profilePic: user.profilePic,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Delete Profile Pic Api",
      error,
    });
  }
};

// Update the existing updateProfilePicController to return user data
export const updateProfilePicController = async (req, res) => {
  try {
    const user = await userModal.findById(req.user._id);
    
    // Check if file is provided
    if (!req.file) {
      return res.status(400).send({
        success: false,
        message: "Please provide an image file",
      });
    }

    // file get from client
    const file = getDataUri(req.file);
    
    // delete prev image if exists
    if (user.profilePic && user.profilePic.public_id) {
      await cloudinary.v2.uploader.destroy(user.profilePic.public_id);
    }
    
    // upload new image
    const cdb = await cloudinary.v2.uploader.upload(file.content);
    user.profilePic = {
      public_id: cdb.public_id,
      url: cdb.secure_url,
    };

    // save function
    await user.save();
    
    res.status(200).send({
      success: true,
      message: "Profile picture updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profilePic: user.profilePic,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in update Profile Pic Api",
      error,
    });
  }
};

// Update the existing updateProfileController to return user data
export const updateProfileController = async (req, res) => {
  try {
    const user = await userModal.findById(req.user._id);
    const { name, email, phone } = req.body;
    
    // validation and update
    if (name) user.name = name;
    if (email) {
      // Check if email is already taken by another user
      const existingUser = await userModal.findOne({ 
        email, 
        _id: { $ne: req.user._id } 
      });
      if (existingUser) {
        return res.status(400).send({
          success: false,
          message: "Email already taken by another user",
        });
      }
      user.email = email;
    }
    if (phone) user.phone = phone;

    // save user
    await user.save();
    
    res.status(200).send({
      success: true,
      message: "User Profile Updated Successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profilePic: user.profilePic,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in UpdateProfile Api",
      error,
    });
  }
};

