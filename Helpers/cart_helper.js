const cartCollection = require("../models/cartModel");
const productCollection = require("../models/productModel");
const ObjectId = require("objectid");

module.exports = {
  addToCart: (prodId, userId, quantity, price, offerPrice) => {
    return new Promise(async (resolve, reject) => {
      try {
        // Check if the user already has a cart
        let existingCart = await cartCollection
          .findOne({ user: userId })
          .lean();

        if (existingCart) {
          // If the user already has a cart, check if the product exists in the cart items
          const existingItem = existingCart.items.find(
            (item) => item.product.toString() === prodId
          );

          if (existingItem) {
            console.log("true");
            // If the product exists in the cart items, update the quantity
            existingItem.quantity += quantity;
          } else {
            // If the product does not exist in the cart items, add it to the cart
            if (offerPrice > 0) {
              existingCart.items.push({
                product: prodId,
                quantity,
                price,
                offerPrice,
              });
            } else {
              existingCart.items.push({
                product: prodId,
                quantity,
                price,
              });
            }
          }

          // Save the updated cart
          await cartCollection.findByIdAndUpdate(
            existingCart._id,
            existingCart
          );
          resolve();
        } else {
          // If the user does not have a cart, create a new cart and add the product
          const newCart = new cartCollection({
            user: userId,
            items: [{ product: prodId, quantity, price, offerPrice }],
          });
          await newCart.save();
          resolve();
        }
      } catch (error) {
        console.error("Error adding product to cart:", error);
      }
    });
  },
  updateQuantity: async (req, res) => {
    const { productId } = req.params;
    const { quantity } = req.body;
    try {
      // Find the user's cart
      const cart = await cartCollection.findOne({ user: req.session.user._id });
      if (!cart) {
        return res.send(404).json({ error: "Cart not found" });
      }

      // Check if the product exists in the cart items
      const existingItem = cart.items.find(
        (item) => item.product.toString() === productId
      );

      if (!existingItem) {
        return res.status(404).json({ error: "Product not found in cart" });
      }

      // Update the quantity
      existingItem.quantity = parseInt(quantity);

      // Save the updated cart
      await cart.save();

      return res.status(200).json({ message: "Quantity updated successfully" });
    } catch (error) {
      console.error("Error updating quantity:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },

  deleteProduct: async (req, res) => {
    const productId = req.params.productId;

    try {
      // Find the user's cart
      const cart = await cartCollection.findOne({ user: req.session.user._id });
      if (!cart) {
        return res.status(404).json({ error: "Cart not found" });
      }
      // Remove the product from the cart items
      cart.items = cart.items.filter(
        (item) => item.product.toString() !== productId
      );
      // Save the updated cart
      await cart.save();
      res.json({
        message: "Item removed from wishlist!",
        status: true,
      });
    } catch (err) {
      console.error("Error deleting product:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
  checkIfProductInCart: async (req, res) => {
    const userId = req.session.user._id;
    const productId = req.params.productId;

    const cart = await cartCollection.findOne({
      user: userId,
      "items.product": productId,
    });

    if (cart) {
      return res.status(200).json({ inCart: true });
    } else {
      return res.status(200).json({ inCart: false });
    }
  },
};
