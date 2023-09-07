const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  code: { type: String, unique: true },
  category: String,
  discountType: { type: String, enum: ["percentage", "fixed"] },
  discountValue: Number,
  validFrom: Date,
  validUntil: Date,
  minCartAmount: Number,
  usedCount: { type: Number, default: 0 },
});

const Coupon = mongoose.model("Coupon", couponSchema);

module.exports = Coupon;
