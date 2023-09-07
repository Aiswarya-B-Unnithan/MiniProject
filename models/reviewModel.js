// models/reviewModel.js
const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  avgRating: {
    type: Number,
    default: 0, 
    
  },
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
