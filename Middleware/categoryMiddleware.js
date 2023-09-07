// categoryMiddleware.js
const Category = require("../models/categoryModel");

// Middleware function to fetch all categories and make it available to all routes
const getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ deleted: false }).lean();
    res.locals.categories = categories;
    next();
  } catch (error) {
    console.log("Error fetching categories:", error);
    res.locals.categories = []; // Set an empty array in case of error
    next();
  }
};

module.exports = { getAllCategories };
