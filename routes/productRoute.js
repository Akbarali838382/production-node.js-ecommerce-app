import express from "express";
import { isAuth } from "./../middlewares/authMiddleware.js";
import {
  createProductController,
  deleteProductController,
  deleteProductImageController,
  getAllProductController,
  getSingleProduct,
  getTopProductController,
  productReviewController,
  updateProductController,
} from "../controllers/productController.js";
import { SingleUpload } from "../middlewares/multer.js";

const router = express.Router();

// routes
// get all product
router.get("/get-all", getAllProductController);

// get Top product
router.get("/top", getTopProductController);

// get single product
router.get("/:id", getSingleProduct);

// get single product
router.post("/create",  SingleUpload, createProductController);

// update Product
router.put("/:id", isAuth, SingleUpload, updateProductController);

// delete product image
router.delete("/delete-image/:id", isAuth, deleteProductImageController);

// delete product 
router.delete("/delete/:id", isAuth, deleteProductController);

// reviews product 
router.put("/:id/review", isAuth, productReviewController);

export default router;
