module.exports = {
  getpayment: async (req, res) => {
    const cartTotal = req.query.cartTotal;
    const paymentMethod = req.query.paymentMethod;
    const CouponDiscountAmount = req.query.CouponDiscountAmount;
    console.log("cod payment");
    console.log("paymentMethod", paymentMethod);
    res.redirect(
      `/order/submitOrder?discountedTotal=${cartTotal}&paymentMethod=${paymentMethod}&CouponDiscountAmount=${CouponDiscountAmount}`
    );
  },
  submitPayment: async (req, res) => {},
};
