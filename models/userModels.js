import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import JWT from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "name is require"],
    },
    email: {
      type: String,
      required: [true, "email is require"],
      unique: [true, "email already taken"],
    },
    password: {
      type: String,
      required: [true, "password is require"],
      minLength: [7, "password should be 7 character"],
    },
    profilePic: {
      public_id: {
        type: String,
      },
      url: {
        type: String,
      },
    },
    phone: {
      type: String,
    },
    answer: { type: String }, // Existing field for security question
  resetPasswordOTP: { type: String }, // Store OTP
  resetPasswordExpires: { type: Date },
  
  },
  { timestamps: true }
);

// function
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});


// compare function
userSchema.methods.comparePassword = async function (plainPassword) {
  return await bcrypt.compare(plainPassword, this.password);
};

//JWT token
userSchema.methods.generateToken = function () {
  return JWT.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: "15d",
  });
};

export const userModal = mongoose.model("Users", userSchema);

export default userModal;
