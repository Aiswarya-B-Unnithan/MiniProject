const mongoose = require("mongoose");
// Connect to MongoDB
const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGODB_SERVER_URL);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
};
module.exports = connectDB;
