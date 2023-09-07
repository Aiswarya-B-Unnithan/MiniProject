const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User model
    required: true,
    unique: true,
  },
  balance: {
    type: Number,
    default: 0,
  },
  transactions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction", // You could have a separate Transaction model for detailed transaction records
    },
  ],
});

const Wallet = mongoose.model("Wallet", walletSchema);

module.exports = Wallet;
