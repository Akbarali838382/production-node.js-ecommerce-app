import express from "express";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cloudinary from "cloudinary";
import Stripe from 'stripe';
import helmet from 'helmet';

import connectedDB from "./config/db.js";

// dot env config
dotenv.config();

// database connection
connectedDB();

// stripe configration
export const stripe = new Stripe(process.env.STRIPE_API_SECRET)

// cloudinary config
cloudinary.v2.config({
  cloud_name: process.env.CLOUDNARY_NAME,
  api_key: process.env.CLOUDNARY_API_KEY,
  api_secret: process.env.CLOUDNARY_SECERET,
});

// rest object
const app = express();

// middleware
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(cors());
app.use(cookieParser());

// route
// route import
import testRoute from "./routes/testRoute.js";
import userRoute from "./routes/userRoutes.js";
import productRoute from "./routes/productRoute.js";
import categoryRoute from "./routes/categoryRoute.js";
import orderRoute from "./routes/orderRoute.js";
// import adminRoute from "./routes/adminRoutes.js"
app.use("/api/v1", testRoute);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/product", productRoute);
app.use("/api/v1/category", categoryRoute);
app.use("/api/v1/orders", orderRoute);
// app.use("/api/v1/admin", adminRoute);

app.get("/", (req, res) => {
  return res.status(200).send("<h1>Welcome to node server</h1>");
});

// port
const PORT = process.env.PORT || 8080;

app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `✅ Server running on http://0.0.0.0:${PORT} in ${process.env.NODE_ENV} Mode`
  );
});
