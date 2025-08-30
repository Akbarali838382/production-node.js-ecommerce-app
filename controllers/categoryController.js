import productModel from "../models/ProductModels.js";
import { categoryModel } from "./../models/categoryModal.js";

// create category
export const createCategoryController = async (req, res) => {
  try {
    const { category } = req.body;
    // validation
    if (!category) {
      return res.status(404).send({
        success: false,
        message: "please provide catgory name",
      });
    }
    await categoryModel.create({ category });
    res.status(201).send({
      success: true,
      message: `${category} category created successfully`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Create Cat Api",
    });
  }
};

// get all category
export const getAllCategoryController = async (req, res) => {
  try {
    const categories = await categoryModel.find({});
    res.status(200).send({
      success: true,
      message: "category fetch successfully",
      totalCat: categories.length,
      categories,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in get All Cat Api",
    });
  }
};

// delete category
export const deleteCategoryController = async (req, res) => {
  try {
    const category = await categoryModel.findById(req.params.id);
    // validation
    if (!category) {
      return res.status(404).send({
        success: false,
        message: "Category not found",
      });
    }
    // find product with category id
    const products = await productModel.find({ category: category._id });
    // udate product category
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      product.category = undefined;
      await product.save();
    }
    // save
    await category.deleteOne();
    res.status(200).send({
      success: true,
      message: "delete Category successfully",
    });
  } catch (error) {
    console.log(error);
    // cast Error
    if (error.name === "CastError") {
      return res.status(500).send({
        success: false,
        message: "Invalid Id",
      });
    }
    res.status(500).send({
      success: false,
      message: "Error in delete Cat Api",
    });
  }
};
// update category
export const updateCategoryController = async (req, res) => {
  try {
    const category = await categoryModel.findById(req.params.id);
    // validation
    if (!category) {
      return res.status(404).send({
        success: false,
        message: "Category not found",
      });
    }
    // get new cat
    const { updatedCategory } = req.body;
    // find product with category id
    const products = await productModel.find({ category: category._id });
    // udate product category
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      product.category = updatedCategory;
      await product.save();
    }

    if(updatedCategory) category.category = updatedCategory

    // save
    await category.save();
    res.status(200).send({
      success: true,
      message: "update Category successfully",
    });
  } catch (error) {
    console.log(error);
    // cast Error
    if (error.name === "CastError") {
      return res.status(500).send({
        success: false,
        message: "Invalid Id",
      });
    }
    res.status(500).send({
      success: false,
      message: "Error in update Cat Api",
    });
  }
};
