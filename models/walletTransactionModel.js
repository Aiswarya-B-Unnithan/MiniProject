const mongoose = require("mongoose");
const user = require("./userModel");
const walletTransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User model
    required: true,
  },
  orderInfo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "order",
  },
  type: {
    type: String,
    enum: ["debit", "credit"], // Debit for deductions, Credit for additions
    required: true,
  },
  amount: {
    type: Number,
  },
  description: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const WalletTransaction = mongoose.model(
  "WalletTransaction",
  walletTransactionSchema
);

module.exports = WalletTransaction;
