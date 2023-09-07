const categoryCollection = require("../../models/categoryModel");
const offerCollection = require("../../models/offerModel");

module.exports = {
  viewOffers: async (req, res) => {
    const availableCategories = await categoryCollection
      .find({
        deleted: false,
      })
      .lean();
    const availableOffers = await offerCollection.find().lean();
    res.render("admin/offerManagement", {
      availableCategories,
      availableOffers,
    });
  },
  addNewOffer: async (req, res) => {
    try {
      const { offername, category, percentage } = req.body;

      const offer = new offerCollection({
        offerName: offername,
        category: category,
        discountPercentage: percentage,
      });

      await offer.save();
      res.redirect("/admin/viewOffers");
    } catch (error) {
      // console.log(error);
    }
  },
};
