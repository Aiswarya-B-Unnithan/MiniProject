const express = require("express");
const Router = express.Router();
const wishlistHelper = require("../Helpers/whishlistHelper");
const whishlistHelper = require("../Helpers/whishlistHelper");

Router.get("/userWishList", wishlistHelper.getWishlist);
Router.post("/userWhishList", wishlistHelper.addToWishList);
Router.get("/remove_from_wishlist", whishlistHelper.removeWishList);

module.exports = Router;
