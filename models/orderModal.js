import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    shippingInfo: {
      address: {
        type: String,
        require: [true, "address is required"],
      },
      city: {
        type: String,
        require: [true, "city name is required"],
      },
      country: {
        type: String,
        require: [true, "country name is required"],
      },
    },
    "orderItems": [
      {
        name: {
          type: String,
          require: [true, "product name is required"],
        },
        price: {
          type: Number,
          require: [true, "product price is required"],
        },
        quantity: {
          type: Number,
          require: [true, "product quantity is required"],
        },
        image: {
          type: String,
          require: [true, "product images is required"],
          required: true,
        },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
      },
    ],
    paymentMethod:{
        type:String,
        enum:["COD","ONLINE"],
        default:"COD"
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Users',
        required:true
    },
    paidAt:Date,
    paymentInfo:{
        id:String,
        status:String,
    },
    itemPrice:{
        type:Number,
        required:[true,'Item Price is Required']
    },
    tax:{
        type:Number,
        required:[true,'tax Price is Required']
    },
    shippingCharges:{
        type:Number,
        required:[true,'Item shippingCharges is Required']
    },
    totalAmount:{
        type:Number,
        required:[true,'Item totalAmount Price is Required']
    },
    orderStatus:{
        type:String,
        enum:['processing','shipped','deliverd'],
        default:'processing'
    },
    deliverdAt:Date
  },
  { timestamps: true }
);

export const orderModal = mongoose.model("orders", orderSchema);
export default orderModal;
