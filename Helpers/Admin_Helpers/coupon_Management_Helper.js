const couponCollection = require("../../models/couponModel");
const categoryCollection = require("../../models/categoryModel");
module.exports = {
  getaddCouponPage: async (req, res) => {
    const categories = await categoryCollection.find().lean();
    res.render("admin/addCoupon", { categories });
  },
  addCoupon: async (req, res) => {
    try {
      const {
        code,
        discountType,
        discountValue,
        category,
        validFrom,
        validUntil,
        minCartAmount,
      } = req.body;
      const coupon = new couponCollection({
        code,
        category,
        discountType,
        discountValue,
        validFrom,
        validUntil,
        minCartAmount,
      });
      await coupon.save();
      res.redirect("/admin/viewCoupon");
    } catch (error) {
      req.session.couponError = "Coupon Creation Failed";
      res.redirect("/admin/viewCoupon");
    }
  },

  viewCoupons: async (req, res) => {
    try {
      const coupons = await couponCollection.find({}).lean();
      res.render("admin/viewCoupon", { coupons });
      //   res.json(coupons);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch coupons" });
    }
  },
};
