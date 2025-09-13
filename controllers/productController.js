import productModel from "../models/ProductModels.js";
import cloudinary from "cloudinary";
import { getDataUri } from "../utils/features.js";
import slugify from "slugify";

export const getAllProductController = async (req, res) => {
  const { keyword, category } = req.query;
  try {
    let query = {};

    // keyword filter
    if (keyword) {
      query.name = { $regex: keyword, $options: 'i' };
    }

    // category filter
    if (category) {
      query.category = category;
    }

    const products = await productModel.find(query).populate('category');

    res.status(200).send({
      success: true,
      message: "all product fetch successfully",
      totalProducts: products.length,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "error in get all product api",
      error,
    });
  }
};


// get top product  
export const getTopProductController = async (req,res) => {
  try {
    const products = await productModel.find({}).sort({rating:-1}).limit(3)
    res.status(200).send({
      success: true,
      message: "top 3 product",
      products
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "error in get top product api",
      error,
    });
  }
}

// get single product
export const getSingleProduct = async (req, res) => {
  try {
    // get product id
    const product = await productModel.findById(req.params.id);
    // validation
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found",
      });
    }
    res.status(200).send({
      success: true,
      message: "single product fetch successfully",
      product,
    });
  } catch (error) {
    console.log(error);
    if (error.name === "CastError") {
      return res.status(500).send({
        success: false,
        message: "Invalid id",
      });
    }
    res.status(500).send({
      success: false,
      message: "error in single product api",
      error,
    });
  }
};

  // create Product
  export const createProductController = async (req, res) => {
    try {
      const { name, description, price, discount, stock, category, quantity } =
        req.body;
      // validation
      if (!name || !description || !price || !stock || !quantity) {
        return req.status(500).send({
          success: false,
          message: "please provide all filled",
        });
      }

      // file validation
      if (!req.file) {
        return res.status(500).send({
          success: false,
          message: "please provide product images",
        });
      }

      const file = getDataUri(req.file);
      const cdb = await cloudinary.v2.uploader.upload(file.content);
      const image = {
        public_id: cdb.public_id,
        url: cdb.secure_url,
      };

      await productModel.create({
        name,
        description,
        price,
        discount,
        stock,
        category,
        quantity,
        images: [image],
      });

      res.status(201).send({
        success: true,
        message: "product create successfully",
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: "error in single product api",
        error,
      });
    }
  };

export const updateProductController = async (req, res) => {
  try {
    const product = await productModel.findById(req.params.id);
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found",
      });
    }

    const { name, description, price, discount, stock, category, quantity } =
      req.body;

      if (typeof name !== "undefined") {
  product.name = name;
  product.slug = slugify(name, { lower: true, strict: true });
}

    if (typeof name !== "undefined") product.name = name;
    if (typeof description !== "undefined") product.description = description;
    if (typeof price !== "undefined") product.price = Number(price);
    if (typeof discount !== "undefined") product.discount = Number(discount);
    if (typeof stock !== "undefined") product.stock = Number(stock);
    if (typeof category !== "undefined") product.category = category;
    if (typeof quantity !== "undefined") product.quantity = Number(quantity);
    
    // Optional: handle image update
    if (req.file) {
      const file = getDataUri(req.file);
      const cdb = await cloudinary.v2.uploader.upload(file.content);
      const image = {
        public_id: cdb.public_id,
        url: cdb.secure_url,
      };
      product.images = [image];
    }

    await product.save();

    res.status(200).send({
      success: true,
      message: "Product details updated",
      product,
    });
  } catch (error) {
    console.log(error);
    if (error.name === "CastError") {
      return res.status(400).send({
        success: false,
        message: "Invalid product ID",
      });
    }
    res.status(500).send({
      success: false,
      message: "Error in update product API",
      error,
    });
  }
};

// delete product image
export const deleteProductImageController = async (req, res) => {
  try {
    // find product
    const product = await productModel.findById(req.params.id);
    // validation
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "product not found",
      });
    }

    // image id find
    const id = req.query.id;
    if (!id) {
      return res.status(404).send({
        success: false,
        message: "pr  oduct image not found",
      });
    }
    let isExist = -1;
    product.images.forEach((item, index) => {
      if (item._id.toString() === id.toString()) isExist = index;
    });
    if (isExist < 0) {
      return res.status(404).send({
        success: false,
        message: "Image not found",
      });
    }

    // delete product image
    await cloudinary.v2.uploader.destroy(product.images[isExist].public_id);
    product.images.splice(isExist, 1);

    // save
    await product.save();
    return res.status(200).send({
      success: true,
      message: "Product image Delete successfully",
    });
  } catch (error) {
    console.log(error);
    if (error.name === "CastError") {
      return res.status(400).send({
        success: false,
        message: "Invalid product ID",
      });
    }
    res.status(500).send({
      success: false,
      message: "Error in delete product image API",
      error,
    });
  }
};

// delete product controller
export const deleteProductController = async (req, res) => {
  try {
    // find product
    const product = await productModel.findById(req.params.id);
    // validation
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "product not found",
      });
    }
    // find and delete image clounary
    for (let index = 0; index < product.images.length; index++) {
      await cloudinary.v2.uploader.destroy(product.images[index].public_id);
    }
    await product.deleteOne();
    res.status(200).send({
      success: true,
      message: "product delete successfully",
    });
  } catch (error) {
    console.log(error);
    if (error.name === "CastError") {
      return res.status(400).send({
        success: false,
        message: "Invalid product ID",
      });
    }
    res.status(500).send({
      success: false,
      message: "Error in delete product API",
      error,
    });
  }
};


// create product review and rating
export const productReviewController = async (req,res) => {
  try {
    // get product
    const {comment,rating} = req.body;
    // find product 
    const product = await productModel.findById(req.params.id);
    // check prev reviews
    const alreadyReviewed = product.reviews.find( (r) => r.user.toString() === req.user._id.toString())
    if(alreadyReviewed){
        return res.status(401).send({
          success:false,
          message:'Product alread Review'
        })
    }
    const review = {
      name:req.user.name,
      rating:Number(rating),
      comment,
      user:req.user._id
    }
    // passing rev object to review arry
    product.reviews.push(review);
    // save num of reviews
    product.numReviews = product.reviews.length;
    product.rating = product.reviews.reduce((acc,item)=> item.rating + acc, 0 )/product.reviews.length;
    // save
    await product.save();
     return res.status(201).send({
          success:true,
          message:' Review added'
        })
  } catch (error) {
     console.log(error);
    if (error.name === "CastError") {
      return res.status(400).send({
        success: false,
        message: "Invalid product ID",
      });
    }
    res.status(500).send({
      success: false,
      message: "Error in Review comment API",
      error,
    });
  }
}