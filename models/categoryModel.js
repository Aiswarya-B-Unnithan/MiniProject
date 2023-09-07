const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      index: { unique: true },
    },
    description: { type: String },
    createdAt: { type: Date, default: Date.now },
    deleted: { type: Boolean, default: false },
  },
  {
    // Set collation at the schema level
    collation: { locale: "en", strength: 2 }, // Adjust locale and strength as needed
  }
);

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
