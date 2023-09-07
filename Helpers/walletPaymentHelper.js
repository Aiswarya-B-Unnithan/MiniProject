const WalletTransactionCollection = require("../models/walletTransactionModel");
const User = require("../models/userModel");
const walletTransactionCollection = require("../models/walletTransactionModel");

module.exports = {
  getpayment: async (req, res) => {
    const userWalletAmount = req.session.user.wallet;
    const discountedTotal = req.query.discountedTotal;
    const paymentMethod = req.query.paymentMethod;
    const cartTotal = req.query.cartTotal;
    const couponDiscountAmount = req.query.CouponDiscountAmount;
    console.log("wallet payment");
    console.log("discountedTotal", discountedTotal);
    res.render("user/walletPayment", {
      totalAmount: discountedTotal,
      cartTotal,
      userWalletAmount,
      paymentMethod,
      couponDiscountAmount,
    });
  },
  submitPayment: async (req, res) => {
    console.log("submit payement");
    const userId = req.session.user._id;
    const walletAmount = req.session.user.wallet;
    const totalAmount = req.body.totalAmount;
    const paymentMethod = req.body.paymentMethod;
    const CouponDiscountAmount = req.body.couponDiscountAmount;
    const cartTotal = req.body.cartTotal;
    console.log("totalAmount", totalAmount);
    console.log("walletAmount", walletAmount);
    console.log("payement Method", paymentMethod);
    const userInfo = await User.findById(userId);
    // Check if user has enough balance in the wallet
    if (walletAmount >= cartTotal) {
      // Deduct the payment amount from user's wallet
      userInfo.wallet -= cartTotal;
      console.log("submit wallet payment");
      // Create a wallet transaction record
      const walletTransaction = new WalletTransactionCollection({
        user: userId,
        orderInfo: req.session.userCartId,
        type: "debit", // Debit for payment
        amount: cartTotal,
        description: "Payment for order",
        paymentMethod,
      });
      // Save the wallet transaction and user updates
      await Promise.all([userInfo.save(), walletTransaction.save()]);

      res.redirect(
        `/order/submitOrder?discountedTotal=${cartTotal}&paymentMethod=${paymentMethod}&CouponDiscountAmount=${CouponDiscountAmount}`
      );
    }
  },
  getWalletTranscationHistory: async (req, res) => {
    const user = req.session.user;
    const userId = req.session.user._id;
    const transactionHistory = await walletTransactionCollection
      .find({ user: userId })
      .lean();

    res.render("user/walletTransactionHistroy", {
      transactionHistory,
      user,
      cartCount: res.locals.cart_Count,
    });
    // console.log("transactionHistory", transactionHistory);
  },
};
