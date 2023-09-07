const express = require("express");
const Router = express.Router();
const mongoose = require("mongoose");
const cartCollection = require("../models/cartModel");
const productCollection = require("../models/productModel");
const cartHelper = require("../Helpers/cart_helper");
const verification = require("../Helpers/verification_helper");
const updateStockMiddleware = require("../Middleware/updateStockMiddleware");
const cart_helper = require("../Helpers/cart_helper");
const Swal = require("sweetalert2");
const couponCollection = require("../models/couponModel");
const categoryCollection = require("../models/categoryModel");
// Configure express to parse request bodies

let offerPrice = 0;

//View Cart
Router.get("/", verification, async (req, res) => {
  const userId = req.session.user._id;
  const user = req.session.user;
  let filteredCoupons = [];
  let mainImages = [];
  try {
    // Find the user's cart
    const cart = await cartCollection
      .findOne({ user: userId })
      .lean()
      .populate("items.product")
      .lean()
      .exec();

    if (cart && cart.items.length > 0) {
      cart.items.forEach((item) => {
        const product = item.product;
        // Set the first image as the main image if there are images, otherwise set it to an empty string

        let mainImage = product.images.length > 0 ? product.images[0] : "";
        mainImages.push(mainImage);
      });

      const cartValue = true;
      // Calculate the total price of all items in the cart
      let totalPrice = 0;
      let totalAmountWithOutDiscount = 0;
      for (const item of cart.items) {
        if (item.offerPrice) {
          totalPrice += item.offerPrice * item.quantity;
        } else {
          totalPrice += item.price * item.quantity;
        }
      }
      // req.session.user.cartOfferPrice = totalPrice;
      for (const item of cart.items) {
        totalAmountWithOutDiscount += item.price * item.quantity;
      }
      console.log("totalAmountWithOutDiscount", totalAmountWithOutDiscount);
      console.log("totalPriceWithDiscountLine49", totalPrice);
      //Checking Coupons
      const userCart = await cartCollection
        .findOne({ user: userId })
        .populate("items.product")
        .lean();
      req.session.userCartId = userCart._id;
      const productCategories = userCart.items.map(
        (item) => item.product.category
      );

      // Collect all unique category names from the products
      const uniqueCategories = [...new Set(productCategories)];
      const productsInCategories = await productCollection
        .find({
          category: { $in: uniqueCategories },
        })
        .lean();
      const categories = await categoryCollection
        .find({ _id: { $in: uniqueCategories } })
        .lean();

      const categoryNames = categories.map((category) => category.name);
      // Get all available coupons from all unique categories

      if (totalPrice >= 1000) {
        availableCoupons = await couponCollection
          .find({
            category: { $in: categoryNames },
            validUntil: { $gte: new Date() },
          })
          .lean();
        filteredCoupons = availableCoupons.filter((coupon) => {
          return coupon.minCartAmount <= totalPrice;
        });
        console.log("filteredCoupons", filteredCoupons);
      }

      ///////////////////////////////////
      const taxPercentage = 0.05;
      const taxAmount = totalAmountWithOutDiscount * taxPercentage;
      console.log("taxAmountline92", taxAmount);
      // calculating totalAmountwithtax
      let totalAmountWithTax;
      if (totalAmountWithOutDiscount === totalPrice) {
        totalAmountWithTax = totalAmountWithOutDiscount + taxAmount;
      } else {
        totalAmountWithTax = totalPrice + taxAmount;
      }

      console.log("totalAmountWithTaxline100", totalAmountWithTax);
      res.render("user/cart", {
        cart,
        totalPrice,
        totalAmountWithOutDiscount,
        user,
        taxAmount,
        cartValue,
        mainImages,
        totalAmountWithTax,
        availableCoupons: filteredCoupons,
      });
    } else {
      // If cart is empty, render the cart page with an empty cart object
      return res.render("user/emptyCart", {
        cart: { items: [] },
        totalPrice: 0,
        user,
      });
    }
  } catch (error) {
    console.log(error);
  }
  // res.render("user/cart", { user });
});
//add to cart
Router.get("/:id", async (req, res) => {
  const user = req.session.user;
  const proId = req.params.id;
  const userId = req.session.user._id;
  const quantity = parseInt(req.query.quantity);
  const price = parseInt(req.query.price);
  offerPrice = !isNaN(parseInt(req.query.offerPrice))
    ? parseInt(req.query.offerPrice)
    : 0;
  const product = await productCollection.findById(proId);

  console.log("offerPrice", offerPrice);
  //adding offerPrice to session
  req.session.user.offerPrice = offerPrice;

  if (product) {
    if (product.stock === "Instock" && product.ItemStock > 0) {
      if (quantity > product.ItemStock) {
        return res.render("user/Userdashboard", {
          stock: product.ItemStock,
          productName: product.productName,
          message: `Only ${product.ItemStock} quantity available for ${product.productName}`,
        });
      } else {
        cartHelper
          .addToCart(proId, userId, quantity, price, offerPrice)
          .then(() => {
            // Show a success alert
            Swal.fire(
              "Product Added",
              "The product has been added to your cart.",
              "success"
            );

            // resolve();
            res.redirect("/dashboard");
          });
      }
    } else {
      if (product.ItemStock === 0) {
        product.stock = "Out_of_Stock";
        await product.save();
        req.session.errmsg = "Product is not available now";
        console.log("Product is not available now");

        return res.send(
          `<script>alert("Product is not available now"); window.location.href = "/product?id=${proId}";</script>`
        );
      }
    }
  } else {
    console.log("Something went wrong");
  }
});

// Update product quantity in cart
Router.put("/update-quantity/:productId", cartHelper.updateQuantity);

// Delete product from cart
Router.delete("/delete/:productId", cartHelper.deleteProduct);

Router.get("/check/:productId", cart_helper.checkIfProductInCart);

module.exports = Router;
async function addToWishlist(productId) {
  console.log("whishList");
  try {
    // Make an AJAX request to add the product to the wishlist
    const response = await $.ajax({
      url: "/wishlist/userWhishList",
      method: "POST",
      data: { productId },
    });
    deleteProduct(productId);
    // Handle the response (e.g., show a success message)
    Swal.fire(
      "Added to Wishlist",
      "The product has been added to your wishlist.",
      "success"
    );
  } catch (error) {
    console.error(error);
    Swal.fire("Error", "An error occurred while adding to wishlist.", "error");
  }
}
