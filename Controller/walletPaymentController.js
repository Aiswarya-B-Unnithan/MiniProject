const express = require("express");
const Router = express.Router();
const verification = require("../Middleware/UserAuth");
const session = require("express-session");
const walletPaymentHelper = require("../Helpers/walletPaymentHelper");


Router.get("/walletPayment", verification, walletPaymentHelper.getpayment);
Router.post("/walletPayment", verification, walletPaymentHelper.submitPayment);
Router.get("/walletTransactions",verification,walletPaymentHelper.getWalletTranscationHistory)
module.exports = Router;
