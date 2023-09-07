// middleware/fetchCartMiddleware.js
const cartCollection = require("../models/cartModel"); // Import your cart model

const fetchCartItemsMiddleware = async (req, res, next) => {
  const userId = req.session.user._id;

  try {
    const cart = await cartCollection
      .findOne({ user: userId })
      .populate("items.product")
      .lean();

    req.cart = cart; // Attach the cart items to the request object
    next();
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).send("Error fetching cart");
  }
};

module.exports = fetchCartItemsMiddleware;
