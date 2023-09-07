const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const productCollection = require("../models/productModel");
const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",
        required: true,
      },
      quantity: {
        type: Number,
        default: 1,
      },
      price: {
        type: Number,
        required: true,
      },
      offerPrice: {
        type: Number,
      },
    },
  ],
});
cartSchema.plugin(mongoosePaginate);
const cartCollection = mongoose.model("Cart", cartSchema);

module.exports = cartCollection;
