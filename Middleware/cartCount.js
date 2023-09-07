// categoryMiddleware.js
const cartCollection = require("../models/cartModel");

// Middleware function to fetch all categories and make it available to all routes

const getAllCartCount = async (req, res, next) => {
  const userId = req.session.user._id;

  try {
    const userCart = await cartCollection.findOne({ user: userId });

    if (userCart) {
      const itemCount = userCart.items.length;
      res.locals.cart_Count = itemCount;
    } else {
      res.locals.cart_Count = 0;
    }

    next();
  } catch (error) {
    console.log("Error fetching cart:", error);
    res.locals.cart_Count = 0;
    next();
  }
};

module.exports = { getAllCartCount };
