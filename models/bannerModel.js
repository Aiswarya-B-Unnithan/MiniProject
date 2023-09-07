const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true,
  },
  caption: {
    type: String,
    required: true,
  },
  link: String, // Optional link for the banner
});

const Banner = mongoose.model("Banner", bannerSchema);

module.exports = Banner;
