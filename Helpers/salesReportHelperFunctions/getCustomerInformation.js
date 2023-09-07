const orderCollection = require("../../models/orderModel");
const userCollection = require("../../models/userModel");
async function getCustomerInformation() {
  try {
    const orders = await orderCollection.find();

    const customerInfo = {};

    for (const order of orders) {
      const customerId = order.user;

      // Retrieve customer information from user collection
      const customer = await userCollection.findById(customerId);

      if (customer) {
        const customerName = customer.username;
        const customerEmail = customer.email;

        if (!customerInfo[customerId]) {
          customerInfo[customerId] = {
            name: customerName,
            email: customerEmail,
            orders: [],
          };
        }

        customerInfo[customerId].orders.push({
          orderId: order._id,
          orderDate: order.orderDate,
          totalPrice: order.totalPrice,
        });
      }
    }

    return customerInfo;
  } catch (error) {
    console.error("Error fetching customer information:", error);
    throw error;
  }
}

module.exports = getCustomerInformation;
