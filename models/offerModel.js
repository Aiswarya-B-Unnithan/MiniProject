const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema({
  offerName: { type: String, required: true },
  category: { type: String, required: true },
  discountPercentage: { type: Number, required: true },
});

const Offer = mongoose.model("Offer", offerSchema);

module.exports = Offer;
