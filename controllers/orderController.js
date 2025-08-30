import { stripe } from "../index.js";
import orderModal from "../models/orderModal.js";
import productModel from "../models/ProductModels.js";

export const createOrderConrtroller = async (req, res) => {
  try {
    const {
      shippingInfo,
      orderItems,
      paymentMethod,
      paymentInfo,
      itemPrice,
      tax,
      shippingCharges,
      totalAmount,
    } = req.body;
    // validation
    if (
      !shippingInfo ||
      !orderItems ||
      !itemPrice ||
      !tax ||
      !shippingCharges ||
      !totalAmount
    ) {
      return req.status(500).send({
        success: false,
        message: "please provide all filled",
      });
    }

    // create order
    await orderModal.create({
      user: req.user._id,
      shippingInfo,
      orderItems,
      paymentMethod,
      paymentInfo,
      itemPrice,
      tax,
      shippingCharges,
      totalAmount,
    });

    // stock update
    for (let i = 0; i < orderItems.length; i++) {
      // find product
      const product = await productModel.findById(orderItems[i].product);
      product.stock -= orderItems[i].quantity;
      await product.save();
    }
    res.status(201).send({
      success: true,
      message: "Order Placed Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Create Order Api",
    });
  }
};

// my orders
export const getMyOrdersController = async (req, res) => {
  try {
    // find orders
    const orders = await orderModal.find({ user: req.user._id });
    // validation
    if (!orders) {
      return res.status(404).send({
        success: false,
        message: " no orders found",
      });
    }
    res.status(200).send({
      success: true,
      message: "your orders data",
      totalOrder: orders.length,
      orders,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in get my Order Api",
    });
  }
};

// get single order
export const getSingleOrderController = async (req, res) => {
  try {
    // find order
    const order = await orderModal.findById(req.params.id);
    // validation
    if(!order){
        return res.status(404).send({
            success:false,
            message:'no order found'
        })
    }
    res.status(200).send({
        success:true,
        message:'your order fetch',
        order
    })
  } catch (error) {
    console.log(error);
    if(error.name === 'CastError'){
        return res.status(500).send({
            success:false,
            message:'Invaild Id'
        })
    }
    res.status(500).send({
      success: false,
      message: "Error in get single order Api",
    });
  }
};



// accept payment 

export const paymentController = async (req,res) => {
  try {
    // get amount 
    const {totalAmount} = req.body; 
    // validation
    if(!totalAmount){
      return res.status(404).send({
        success:false,
        message:'Total Amount is required'
      })
    }
    const { client_secret } = await stripe.paymentIntents.create({
      amount:Number(totalAmount) * 100,
      currency:'usd'
    })
    res.status(201).send({
      success:true,
      client_secret
    })
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in payment order Api",
    });
  }
}