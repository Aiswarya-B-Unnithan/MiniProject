const mongoose = require("mongoose");
const product = require("./productModel");
const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "product",
    },
  ],
});

const Wishlist = mongoose.model("Wishlist", wishlistSchema);

module.exports = Wishlist;
