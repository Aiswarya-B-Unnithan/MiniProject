const express = require("express");
const Router = express.Router();
const verification = require("../Helpers/verification_helper");
const notificationHelper = require("../Helpers/Admin_Helpers/notificationHelper");
Router.get("/notifications",verification, notificationHelper.getNotification);
Router.get("/view_order/:id",verification, notificationHelper.viewOrder);

module.exports = Router;
