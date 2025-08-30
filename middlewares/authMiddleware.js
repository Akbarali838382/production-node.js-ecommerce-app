import JWT from "jsonwebtoken";
import userModal from "../models/userModels.js";
import Admin from '../models/adminModel.js'

// user Auth
export const isAuth = async (req, res, next) => {
  const { token } = req.cookies;
  // validation
  if (!token) {
    return res.status(401).send({
      success: false,
      message: "UnAuthorized User",
    });
  }
  const decodeData = JWT.verify(token, process.env.JWT_SECRET);
  req.user = await userModal.findById(decodeData._id);
  next();
};


// isAdmin Auth
export const isAdmin = async (req,res,next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if(!token) return res.status(401).json({ message: "No token provided" });

    const decoded = JWT.verify(token,process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id);

    if(!admin || !admin.role !== 'admin'){
       return res.status(403).json({ message: "Access denied" });
    }
     req.admin = admin;
     next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
}