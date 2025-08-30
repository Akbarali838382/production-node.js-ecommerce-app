// routes/adminRoutes.js
import express from "express";
import { registerAdmin, loginAdmin } from "../controllers/adminController.js";
import  isAdmin  from "../middlewares/adminAuth.js";
import productModel from "../models/productModel.js";
import orderModel from "../models/orderModel.js";

const router = express.Router();

router.post("/register", registerAdmin);
router.post("/login", loginAdmin);

// Admin-only routes
router.get("/products", isAdmin, async (req, res) => {
  const products = await productModel.find();
  res.json(products);
});

router.get("/orders", isAdmin, async (req, res) => {
  const orders = await orderModel.find().populate("orderItems.product");
  res.json(orders);
});

export default router;
