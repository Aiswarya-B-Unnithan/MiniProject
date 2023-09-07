const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const popularProductSchema = new mongoose.Schema({
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
});
// Apply pagination plugin to the product schema
popularProductSchema.plugin(mongoosePaginate);
const popularProduct = mongoose.model("popularProduct", popularProductSchema);

module.exports = popularProduct;
