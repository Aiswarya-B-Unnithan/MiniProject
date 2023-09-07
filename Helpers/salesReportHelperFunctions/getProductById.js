const productCollection = require("../../models/productModel");

async function getProductById(productId) {
  try {
    const product = await productCollection.findById(productId);
    console.log("productfromgetProductByIdfn", product);
    return product;
  } catch (error) {
    console.log("Error fetching product by ID:", error);
    throw error;
  }
}

module.exports = getProductById;
