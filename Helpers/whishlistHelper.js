const Wishlist = require("../models/whishlistModel");
const whishlistCollection = require("../models/whishlistModel");

module.exports = {
  getWishlist: async (req, res) => {
    const user = req.session.user;
    let mainImages = [];
    try {
      const userId = req.session.user._id;

      const wishlist = await whishlistCollection
        .findOne({ user: userId })
        .populate("products")
        .lean();
      console.log("wishlist", wishlist);
      if (wishlist) {
        wishlist.products.forEach((product) => {
          // Set the first image as the main image if there are images, otherwise set it to an empty string

          let mainImage = product.images.length > 0 ? product.images[0] : "";
          mainImages.push(mainImage);
        });

        res.render("user/wishlist", {
          wishlist,
          mainImages,
          cartCount: res.locals.cart_Count,
          user,
        });
      } else {
        res.render("user/emptyWishlist", {
          user,
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "An error occurred" });
    }
  },
  addToWishList: async (req, res) => {
    try {
      const userId = req.session.user._id;
      const productId = req.body.productId;
      console.log("productId", productId);
      const wishlist = await whishlistCollection.findOneAndUpdate(
        { user: userId },
        { $addToSet: { products: productId } },

        { upsert: true, new: true }
      );
      res.redirect("/wishlist/userWishList");
      // res.status(200).json({ wishlist });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "An error occurred" });
    }
  },
  removeWishList: async (req, res) => {
    const proId = req.query.id;
    const userId = req.session.user._id;
    console.log("proId", proId);
    const userWishlist = await Wishlist.findOne({
      user: userId,
      products: proId,
    });
    // userWishlist.products.map((productId) => {
    //   if (productId === proId) {
    //     productId = "";
    //   }
    // });

    // Remove the product from the cart items
    userWishlist.products = userWishlist.products.filter(
      (productId) => productId.toString() !== proId
    );

    await userWishlist.save();

    // Send a success response to the client
    res.status(200).json({ message: "Product deleted successfully" });
  },
};
