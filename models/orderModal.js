import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  cartItems: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      name: String,
      price: Number,
      quantity: Number,
      image: String,
    },
  ],
  totalPrice: { type: Number, required: true },
  shippingAddress: {
    address: String,
    city: String,
    country: String,
  },
  paymentMethod: { type: String, enum: ["COD", "ONLINE"], default: "COD" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true },
  status: { type: String, default: "Pending" },
}, { timestamps: true });


export const orderModal = mongoose.model("orders", orderSchema);
export default orderModal;
