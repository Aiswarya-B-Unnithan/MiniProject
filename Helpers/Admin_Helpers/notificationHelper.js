const orderCollection = require("../../models/orderModel");

module.exports = {
  getNotification: async (req, res) => {
    try {
      const notifications = await orderCollection
        .find({ adminViewed: false })
        .sort({ _id: -1 })
        .limit(5)
        .lean();

      res.json(notifications);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "An error occurred while fetching notifications." });
    }
  },
  viewOrder: async (req, res) => {
    const orderId = req.params.id;
    try {
      const order = await orderCollection.findById(orderId);
      if (order) {
        order.adminViewed = true;
        await order.save();
        res.redirect(`/admin/UserOrders/changeStatus/${orderId}`);
        // ...
      } else {
      }
    } catch (error) {
      console.error(error);
    }
  },
};
