import mongoose from "mongoose";

// review modal
const reviewSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "name is required"],
  },
  rating: {
    type: Number,
    default: 0,
  },
  comment: {
    type: String,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: [true, "user Required"],
  },
});

// product modal
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "product name is require"],
    },
    description: {
      type: String,
      required: [true, "product description is require"],
    },
    price: {
      type: Number,
      required: [true, "product price is require"],
    },
    discount: {
      type: Number,
      default: 0, // in percentage
    },
    stock: {
      type: Number,
      required: [true, "product stock is require"],
    },
    quantity: {
      type: Number,
      required: [true, "product quantity is require"],
      set: (v) => Number(v),
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    images: [
      {
        public_id: String,
        url: String,
      },
    ],
    reviews: [reviewSchema],
    rating: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const productModel = mongoose.model("Product", productSchema);
export default productModel;
