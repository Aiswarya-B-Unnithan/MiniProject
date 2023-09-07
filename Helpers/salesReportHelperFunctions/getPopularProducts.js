const orderCollection = require("../../models/orderModel");
const productCollection = require("../../models/productModel");
async function getTopSellingProducts() {
  try {
    const orders = await orderCollection.find();
    let productQuantities = {};

    // Calculate product quantities
    orders.forEach((order) => {
      order.cartItems.forEach((item) => {
        const productId = item.product;
        const quantity = item.quantity;

        if (productQuantities[productId]) {
          productQuantities[productId] += quantity;
        } else {
          productQuantities[productId] = quantity;
        }
      });
    });

    // Get top selling product IDs
    const topSellingProductIds = Object.keys(productQuantities)
      .sort(
        (productIdA, productIdB) =>
          productQuantities[productIdB] - productQuantities[productIdA]
      )
      .slice(0, 3);

    // Fetch top selling product details
    const topSellingProductsDetails = await productCollection.find({
      _id: { $in: topSellingProductIds },
    });

    // Compile and return top selling product data
    const topSellingProducts = topSellingProductsDetails.map((product) => {
      return {
        name: product.productName,
        quantitySold: productQuantities[product._id],
        totalRevenue: productQuantities[product._id] * product.price,
      };
    });

    return topSellingProducts;
  } catch (error) {
    console.error("Error fetching top selling products:", error);
    throw error;
  }
}
module.exports = getTopSellingProducts;
