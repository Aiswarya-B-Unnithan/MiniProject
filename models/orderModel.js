const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const User = require("./userModel");
const productCollection = require("./productModel");
const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  cartItems: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",
      },
      quantity: {
        type: Number,
      },
      price: {
        type: Number,
      },
    },
  ],
  totalPrice: {
    type: Number,
  },

  discountedTotal: {
    type: Number,
    default: 0, // Default value for discountedTotal
  },
  couponCode: {
    type: String,
    default: "No Coupon", // Default value for couponCode
  },
  couponAmount: {
    type: Number,
    default: 0, // Default value for couponAmount
  },
  discountsOnMRP: {
    type: Number,
    default: 0,
  },
  finalPrice: {
    type: Number,
  },
  status: {
    type: String,
    enum: [
      "pending",
      "confirmed",
      "delivered",
      "cancelled",
      "return",
      "returned",
    ],

    default: "pending",
  },
  paymentMethod: {
    type: String,
    enum: ["cashOnDelivery", "walletPayment", "stripePayment"],
  },

  customOrderID: {
    type: Number,
    required: true,
    unique: true,
  },

  adminStatus: {
    type: String,
    enum: ["pending", "confirmed", "cancelled", "delivered", "returned"],
  },
  orderDate: {
    type: Date,
    default: Date.now,
  },
  deliveringAddress: {
    // Define the address fields here
    email: {
      type: String,
    },
    address1: {
      type: String,
    },
    address2: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    postalCode: {
      type: String,
    },
  },
  deliveryDate: {
    type: Date,
  },
  userOrderCancelDate: {
    type: Date,
  },
  returnedDate: {
    type: Date,
  },
  adminOrderCancelDate: {
    type: Date,
  },
  adminViewed: {
    type: Boolean,
    default: false,
  },
  cancelOrderByAdmin: {
    type: Boolean,
    default: false,
  },
  taxPercentage: { type: Number, default: 5 },
});
// Apply pagination plugin to the product schema
orderSchema.plugin(mongoosePaginate);
const orderCollection = mongoose.model("order", orderSchema);
module.exports = orderCollection;
