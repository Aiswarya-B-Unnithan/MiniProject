const popularProductcollection = require("../models/most_popular_products_model");
// Middleware function to fetch all categories and make it available to all routes
const getPopularProducts = async (req, res, next) => {
  var mainImages = [];
  try {
    const popularProducts = await popularProductcollection.find().lean();
    popularProducts.map((product) => {
      // Set the first image as the main image if there are images, otherwise set it to an empty string
      return (mainImages = [
        ...mainImages,
        product.images.length > 0 ? product.images[0] : "",
      ]);
    });
    res.locals.popularProducts = popularProducts;
    res.locals.mainImages = mainImages;
    next();
  } catch (error) {
    console.log("Error fetching popularProducts:", error);
    res.locals.popularProducts = []; // Set an empty array in case of error
    next();
  }
};

module.exports = { getPopularProducts };
