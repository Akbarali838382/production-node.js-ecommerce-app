import { stripe } from "../index.js";
import orderModal from "../models/orderModal.js";
import productModel from "../models/ProductModels.js";
import userModel from "../models/userModels.js";

// Create new order
export const createOrderController = async (req, res) => {
  try {
    const { cartItems, totalPrice, shippingAddress, paymentMethod, paymentInfo } = req.body;

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ success: false, message: "No items in cart" });
    }
    if (!totalPrice || totalPrice <= 0) {
      return res.status(400).json({ success: false, message: "Invalid total price" });
    }
    if (!shippingAddress) {
      return res.status(400).json({ success: false, message: "Shipping address is required" });
    }
    if (!paymentMethod) {
      return res.status(400).json({ success: false, message: "Payment method is required" });
    }

    // Get product details for each cart item
    const cartItemsWithDetails = await Promise.all(
      cartItems.map(async (item) => {
        const product = await productModel.findById(item.product);
        return {
          product: item.product,  // Product ID
          name: product?.name || item.name || 'Unknown Product',
          price: product?.price || item.price || 0,
          image: product && product.images.length > 0 
  ? product.images[0].url 
  : "https://via.placeholder.com/150",  // fallback image

          quantity: item.quantity || 1,
        };
      })
    );

    const order = await orderModal.create({
      user: req.user._id,
      cartItems: cartItemsWithDetails,
      totalPrice,
      shippingAddress,
      paymentMethod,
      paymentInfo,
    });

    await userModel.findByIdAndUpdate(req.user._id, { cart: [] });

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    console.error("Create Order Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: error.message,
    });
  }
};

// My Orders
export const getMyOrdersController = async (req, res) => {
  try {
    const orders = await orderModal
      .find({ user: req.user._id })
      .populate({
        path: 'cartItems.product',
        select: 'name images price', // Keep 'images' if your Product model has images array
      })
      .sort({ createdAt: -1 }); // Sort by newest first

    if (!orders || orders.length === 0) {
      return res.status(200).json({ 
        success: true, 
        message: "No orders found", 
        totalOrder: 0,
        orders: [] 
      });
    }

    res.status(200).json({
      success: true,
      message: "Your orders data",
      totalOrder: orders.length,
      orders,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Error fetching orders" });
  }
};

// Single Order
export const getSingleOrderController = async (req, res) => {
  try {
    const order = await orderModal
      .findById(req.params.id)
      .populate({
        path: 'cartItems.product',
        select: 'name images price',
      });

    if (!order) {
      return res.status(404).json({ success: false, message: 'No order found' });
    }

    res.status(200).json({ success: true, message: 'Order fetched', order });
  } catch (error) {
    console.log(error);
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid Order ID' });
    }
    res.status(500).json({ success: false, message: "Error fetching order" });
  }
};

// Payment Controller
export const paymentController = async (req, res) => {
  try {
    const { amount } = req.body; // already in cents from frontend
    if (!amount) {
      return res.status(400).json({ success: false, message: 'Amount is required' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount, // in cents
      currency: 'usd',
    });

    res.status(201).json({ success: true, clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Payment error" });
  }
};