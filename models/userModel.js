const mongoose = require("mongoose");
// User model
const User = mongoose.model(
  "User",
  new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true },
    phoneNo: {
      type: String,
    },
    otp: { type: String },
    otpExpiration: { type: Date },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpiration: {
      type: Date,
      default: null,
    },
    profilePictureUrl: {
      type: String,
      default: "/default-profile-picture.png",
    },
    blocked: { type: Boolean, default: false },

    wallet: {
      type: Number,
      default: 0, // Default wallet balance is 0
    },
    referralCode: { type: String,required:true },
    registeredDate: {
      type: Date,
      default: Date.now,
    },
  })
);

module.exports = User;
