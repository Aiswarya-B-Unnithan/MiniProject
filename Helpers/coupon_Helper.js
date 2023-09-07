const couponCollection = require("../models/couponModel");
const moment = require("moment");
module.exports = {
  viewCoupons: async (req, res) => {
    try {
      const coupons = await couponCollection.find().lean(); // Fetch all coupons from the database
      // Format dates before passing them to the template
      coupons.forEach((coupon) => {
        coupon.validFromFormatted = moment(coupon.validFrom).format("DD-MM");
        coupon.validUntilFormatted = moment(coupon.validUntil).format("DD-MM");
      });
      res.render("user/coupon", { coupons }); // Render the coupon view template with the coupons data
    } catch (error) {
      console.error("Error fetching coupons:", error);
      res.status(500).json({ error: "An error occurred" });
    }
  },
};
