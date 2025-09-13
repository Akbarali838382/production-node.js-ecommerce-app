import jwt from "jsonwebtoken";
import userModal from "../models/userModels.js";

export const isAuth = async (req, res, next) => {
  try {
    let token;

    // 1. Check cookie
    if (req.cookies?.token) {
      token = req.cookies.token;
    }

    // 2. Check Authorization header (Bearer <token>)
    if (!token && req.headers.authorization) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized User" });
    }

    // ✅ Use `jwt`, not `JWT`
    const decodeData = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await userModal.findById(decodeData._id);

    if (!req.user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    next();
  } catch (error) {
    console.error("Auth error:", error.message);
    res.status(401).json({ success: false, message: "Invalid Token" });
  }
};
