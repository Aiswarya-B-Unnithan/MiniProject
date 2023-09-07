const express = require("express");
const Router = express.Router();
const verification = require("../Middleware/UserAuth");
const session = require("express-session");
const onlinePaymentHelper = require("../Helpers/onlinePaymentHelper");

Router.get("/onlinePayment", verification, onlinePaymentHelper.getpayment);
Router.post("/onlinePayment", verification, onlinePaymentHelper.submitPayment);

module.exports = Router;
