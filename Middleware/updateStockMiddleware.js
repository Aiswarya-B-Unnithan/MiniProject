// middleware/updateStockMiddleware.js
const productCollection = require("../models/productModel"); // Import your product model

const updateStockMiddleware = async (req, res, next) => {
  console.log("updateStockMiddleware");

  try {
    const cart = req.cart;

    if (cart) {
      for (const item of cart.items) {
        const product = await productCollection.findById(item.product._id);
        if (product) {
          if (item.quantity <= product.ItemStock) {
            product.ItemStock -= item.quantity;
            if (product.ItemStock <= 0) {
              product.status = "Out_of_Stock";
            }
            await product.save();
          } else {
            res.render("user/cart", {
              stock: product.ItemStock,
              productName: product.productName,
              message: `Only ${product.ItemStock} quantity available for ${product.productName}`,
            });
          }
        }
      }
    } else {
      console.log("No Cart Found");
    }
    next(); // Continue to the next middleware or route handler
  } catch (error) {
    console.error("Error updating stock:", error);
    res.status(500).send("Error updating stock");
  }
};

module.exports = updateStockMiddleware;
