const orderCollection = require("../../models/orderModel");
async function getDiscountsAndCoupons() {
  try {
    const orders = await orderCollection.find();

    const discountsAndCoupons = {};

    orders.forEach((order) => {
      const couponCode = order.couponCode;
      const couponAmount = order.couponAmount;

      if (couponCode && couponAmount > 0) {
        if (!discountsAndCoupons[couponCode]) {
          discountsAndCoupons[couponCode] = {
            usageCount: 0,
            totalAmountSaved: 0,
          };
        }

        discountsAndCoupons[couponCode].usageCount++;
        discountsAndCoupons[couponCode].totalAmountSaved += couponAmount;
      }
    });

    return discountsAndCoupons;
  } catch (error) {
    console.error("Error fetching discounts and coupons:", error);
    throw error;
  }
}
module.exports = getDiscountsAndCoupons;
