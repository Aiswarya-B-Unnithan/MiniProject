const orderCollection = require("../../models/orderModel");
const getProductById = require("../../Helpers/salesReportHelperFunctions/getProductById");
async function getRevenueByCategory() {
  try {
    const orders = await orderCollection.find();

    // Calculate revenue by category
    const revenueByCategory = {};

    orders.forEach((order) => {
      order.cartItems.forEach((item) => {
        const productId = item.product;
        const quantity = item.quantity;
        const product = getProductById(productId);

        if (product) {
          const category = product.category;
          const productRevenue = quantity * product.price;

          if (revenueByCategory[category]) {
            revenueByCategory[category] += productRevenue;
          } else {
            revenueByCategory[category] = productRevenue;
          }
        }
      });
    });

    return revenueByCategory;
  } catch (error) {
    console.error("Error fetching revenue by category:", error);
    throw error;
  }
}

module.exports = getRevenueByCategory;
