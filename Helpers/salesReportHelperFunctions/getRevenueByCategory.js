const orderCollection = require("../../models/orderModel");
const getProductById = require("../../Helpers/salesReportHelperFunctions/getProductById");
const categoryCollection = require("../../models/categoryModel");
async function getCategoryNameById(categoryId) {
  try {
    const category = await categoryCollection.findById(categoryId);
    return category ? category.name : "Unknown Category";
  } catch (error) {
    console.log("Error fetching category:", error);
    return "Unknown Category";
  }
}

async function getRevenueByCategory() {
  try {
    const orders = await orderCollection.find();

    // Calculate revenue by category
    const revenueByCategory = {};

    for (const order of orders) {
      for (const item of order.cartItems) {
        const productId = item.product;
        const quantity = item.quantity;
        const product = await getProductById(productId);

        if (product) {
          const categoryId = product.category;
          const categoryName = await getCategoryNameById(categoryId); // Get category name
          const productRevenue = quantity * product.price;

          if (revenueByCategory[categoryName]) {
            revenueByCategory[categoryName] += productRevenue;
          } else {
            revenueByCategory[categoryName] = productRevenue;
          }
        }
      }
    }

    return revenueByCategory;
  } catch (error) {
    console.log("Error fetching revenue by category:", error);
    throw error;
  }
}

module.exports = getRevenueByCategory;
