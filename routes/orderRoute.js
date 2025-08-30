import express from 'express'
import { isAuth } from '../middlewares/authMiddleware.js';
import { createOrderConrtroller, getMyOrdersController, getSingleOrderController, paymentController } from '../controllers/orderController.js';

const router = express.Router();

// router
// ************order ROUTE**********

// Create order
router.post('/create',isAuth,createOrderConrtroller);

// get all order
router.get('/my-orders',isAuth,getMyOrdersController);

// get single order
router.get('/my-orders/:id',isAuth,getSingleOrderController);

// accept payment
router.post('/payments',isAuth,paymentController)


export default router