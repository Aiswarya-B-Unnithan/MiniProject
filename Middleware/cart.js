// categoryMiddleware.js
const cartCollection = require("../models/cartModel");
const { populate } = require("../models/categoryModel");

// Middleware function to fetch all categories and make it available to all routes
const getUserCart = async (req, res, next) => {
  console.log("hello");
  const userId = req.session.user._id;
  console.log("userId", userId);
  let mainImages = [];
  try {
    const userCart = await cartCollection
      .findOne({ user: userId })
      .lean()
      .populate("items.product")
      .lean()
      .exec();
    if (userCart && userCart.items.length > 0) {
      // Calculate the total price of all items in the cart
      const totalPrice = userCart.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
      // userCart.items.product.map((product) => {
      //   return (mainImages = [
      //     ...mainImages,
      //     product.images.length > 0 ? product.images[0] : "",
      //   ]);
      // });

      res.locals.userCart = userCart;
      res.locals.totalPrice = totalPrice;
      // res.locals.mainImages = mainImages;

      // console.log("usercart", userCart);
      next();
    } else {
      res.locals.userCart = [];
    }
  } catch (error) {
    console.log("Error fetching cart:", error);
    res.locals.userCart = []; // Set an empty array in case of error
    next();
  }
};

module.exports = { getUserCart };
