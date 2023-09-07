const express = require("express");
const mongoose = require("mongoose");
const addressCollection = require("../models/addressModel");

const Router = express.Router();
const verification = require("../Helpers/verification_helper");
const addressHelper = require("../Helpers/address_Helper");
Router.use(express.json());
Router.get("/", verification, addressHelper.viewAddress);
Router.get("/addAddress", verification, addressHelper.addAddress);
Router.post("/save-address", verification, addressHelper.saveAddress);
Router.get("/add-New-Address", verification, addressHelper.Add_New_Address);
Router.post("/add_New_Address", verification, addressHelper.save_new_address);
Router.get("/checkout", verification, addressHelper.showAddress);
Router.post(
  "/add-checkoutaddress",
  verification,
  addressHelper.addCheckOutAddress
);
Router.get("/getAddresses", verification, addressHelper.fetchAddress);
Router.get("/getAddress/:id", verification, addressHelper.fetchAddressById);
Router.get(
  "/getEditAddress/:id",
  verification,
  addressHelper.fetchEditAddressById
);

Router.get("/payment/:id", verification, addressHelper.showPaymentPage);
Router.get("/confirmation", verification, addressHelper.showConformationPage);

//Edit and Update address on CheckOut
Router.post("/editaddress/:id", verification, addressHelper.saveEditedAddress);

module.exports = Router;
