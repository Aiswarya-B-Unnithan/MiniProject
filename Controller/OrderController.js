const express = require("express");
const Router = express.Router();
const verification = require("../Helpers/verification_helper");
const orderHelper = require("../Helpers/order_helper");
const fetchCartItemsMiddleware = require("../Middleware/fetchCartMiddleware");
const updateStockMiddleware = require("../Middleware/updateStockMiddleware");
// const jsPDF = require("jspdf");
Router.post(
  "/allOrders/:discountedTotal",
  verification,
  fetchCartItemsMiddleware,
  updateStockMiddleware,
  orderHelper.OrdersManagementFn
);
Router.get("/allOrders", verification, orderHelper.viewOrders);
Router.get(
  "/detailedViewOrder/:id",
  verification,
  orderHelper.DetailedViewOfOrder
);
Router.get("/filterByStatus", verification, orderHelper.filterOrder);

Router.post("/requestReturn", verification, orderHelper.orderReturn);
Router.post("/cancel", verification, orderHelper.cancelOrder);
Router.get("/orderSuccess", verification, orderHelper.viewOrderSuccessPage);
Router.get("/submitOrder", verification, orderHelper.submitOrder);
Router.post("/submitOrder", verification, orderHelper.postSubmitOrder);
//checking which payment method user cliked
Router.get(
  "/onlinePayment",
  verification,
  orderHelper.redirectingPaymentRoutes
);

// //Invoice management
// Router.get("/get_invoice", verification, orderHelper.getInvoice);

Router.get("/invoice/:orderId", verification, orderHelper.viewInvoice);

// Router.get(
//   "/downloadInvoice/:orderId",
//   verification,
//   orderHelper.downloadInvoice
// );
module.exports = Router;
