import userModal from "../models/userModels.js";
import { getDataUri } from "./../utils/features.js";
import cloudinary from "cloudinary";

export const registerController = async (req, res) => {
  try {
    const { name, email, password, } = req.body;
    // validation
    if (!name || !email || !password  ) {
      return res.status(500).send({
        success: false,
        message: "please provide all field",
      });
    }

    // check existing user
    const existingUser = await userModal.findOne({ email });
    // Validation
    if (existingUser) {
      return res.status(500).send({
        success: false,
        message: "email already taken",
      });
    }
    const user = await userModal.create({
      name,
      email,
      password,
    });
    res.status(201).send({
      success: true,
      message: "Registeration success",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Register Api",
      error,
    });
  }
};

// login
export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    // validation
    if (!email || !password) {
      return res.status(500).send({
        success: false,
        message: "Please add email or password",
      });
    }
    // check user
    const user = await userModal.findOne({ email });

    // user validation
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User Not Found",
      });
    }
    // check password
    const isMatch = await user.comparePassword(password);
    // validation
    if (!isMatch) {
      return res.status(500).send({
        success: false,
        message: "invaild creadentails",
      });
    }
    // token
    const token = user.generateToken();

    res
      .status(200)
      .cookie("token", token, {
        expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        secure: process.env.NODE_ENV === "development" ? true : false,
        httpOnly: process.env.NODE_ENV === "development" ? true : false,
        sameSite: process.env.NODE_ENV === "development" ? true : false,
      })
      .send({
        success: true,
        message: "Login Successfully",
        token,
        user,
      });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error  in Login Api",
      error,
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

// update profile
export const updateProfileController = async (req, res) => {
  try {
    const user = await userModal.findById(req.user._id);
    const { name, email, phone } = req.body;
    // validation and update
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;

    // save user
    await user.save();
    res.status(200).send({
      success: true,
      message: "User Profile Update",
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
    user.password = newPassword;
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

// update user profile photo

export const updateProfilePicController = async (req, res) => {
  try {
    const user = await userModal.findById(req.user._id);
    // file get from client
    const file = getDataUri(req.file);
    // delete prev image
    await cloudinary.v2.uploader.destroy(user.profilePic.public_id);
    // update
    const cdb = await cloudinary.v2.uploader.upload(file.content);
    user.profilePic = {
      public_id: cdb.public_id,
      url: cdb.secure_url,
    };

    // save function
    await user.save();
    res.status(200).send({
      success: true,
      message: "profile picture updated",
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


// forgot password
export const passwordResetController = async (req,res) => {
  try {
    // user    get email || newpassword || answer
    const {email,newPassword,answer} = req.body;
    if(!email || !newPassword || !answer){
      return res.status(500).send({
        success:false,
        message:"please Provide all feild"
      })
    }
    // find user
    const user = await userModal.findOne({email,answer})
    if(!email){
      return res.status(404).send({
        success:false,
        message:'invalid user or answer'
      })
    }
    
    user.password = newPassword;
    await user.save();
    res.status(200).send({ 
      success:true,
      message:"Your Password has Reset please Login "
    })
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Password Reset  Api",
      error,
    });
  }
}