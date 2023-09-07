const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const productSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },
  images: [String],
  deleted: { type: Boolean, default: false },
  stock: {
    type: String,
    enum: ["Instock", "Out_of_Stock"],
    required: true,
    default: "Instock",
  },
  ItemStock: {
    type: Number,
    default: 0, // Initial stock value
  },
  customID: {
    type: Number,
    required: true,
    unique: true,
  },
  offerPrice: {
    type: Number,
    default: 0,
  },
});
// Apply pagination plugin to the product schema
productSchema.plugin(mongoosePaginate);
const product = mongoose.model("product", productSchema);

module.exports = product;
