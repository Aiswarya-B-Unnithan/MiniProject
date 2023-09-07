const orderCollection = require("../../models/orderModel");
async function getRevenueByDate(dateRange) {
  try {
    const orders = await orderCollection.find();

    // Calculate revenue by date
    const revenueByDate = {};

    orders.forEach((order) => {
      const orderDate = new Date(order.orderDate);

      // Pass an array of the current order to calculateOrderRevenue
      const orderRevenue = calculateOrderRevenue([order]);

      const formattedDate = formatDateTime(orderDate, dateRange);

      if (revenueByDate[formattedDate]) {
        revenueByDate[formattedDate] += orderRevenue;
      } else {
        revenueByDate[formattedDate] = orderRevenue;
      }
    });

    return revenueByDate;
  } catch (error) {
    console.error("Error fetching revenue by date:", error);
    throw error;
  }
}
module.exports = getRevenueByDate;

function calculateOrderRevenue(orders) {
  let totalRevenue = 0;

  for (const order of orders) {
    totalRevenue += order.totalPrice;
  }

  return totalRevenue;
}

function formatDateTime(dateTime, format) {
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  };

  return dateTime.toLocaleDateString(undefined, options);
}
