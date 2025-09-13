import express from 'express'
import { isAuth } from '../middlewares/authMiddleware.js';
import { createCategoryController, deleteCategoryController, getAllCategoryController, updateCategoryController } from '../controllers/categoryController.js';

const router = express.Router();

// router
// ************CAT ROUTE**********

// Create Category
router.post('/create',createCategoryController);

// get all Category
router.get('/get-all',getAllCategoryController);

// delete Category
router.delete('/delete/:id',isAuth,deleteCategoryController);

// update Category
router.put('/update/:id',isAuth,updateCategoryController);

export default router