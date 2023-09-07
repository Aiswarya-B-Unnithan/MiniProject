const express = require("express");
const Router = express.Router();
const verification = require("../Middleware/UserAuth");
const session = require("express-session");
const codPaymentHelper = require("../Helpers/codPaymentHelper");

Router.get("/cashOnDelivery", verification, codPaymentHelper.getpayment);
Router.post("/cashOnDelivery", verification, codPaymentHelper.submitPayment);

module.exports = Router;
