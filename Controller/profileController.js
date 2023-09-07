const express = require("express");
const mongoose = require("mongoose");
const profile_helper = require("../Helpers/profile_helper");
const Router = express.Router();
const verification = require("../Helpers/verification_helper");
const multer = require("multer");

// Configure multer storage for profile picture uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});
const upload = multer({ storage: storage });

Router.get("/viewProfile", verification, profile_helper.viewProfile);
Router.get("/viewUserProfile", verification, profile_helper.viewUserProfile);

Router.get("/edit-details", verification, profile_helper.editDetails);
Router.post("/updateProfile/:id", verification, profile_helper.updateProfile);
Router.post(
  "/upload-profile-picture",
  verification,
  upload.single("profilePicture"),
  profile_helper.uploadProPic
);
Router.get("/resetPassword", verification, profile_helper.resetPassword);
Router.post("/reset_Password", verification, profile_helper.updatePassword);

//Address Management
Router.get("/manageAddress", verification, profile_helper.manageAddress);
Router.get("/editaddress/:id", verification, profile_helper.editAddress);
Router.post("/editaddress/:id", verification, profile_helper.saveEditedAddress);

Router.get("/delete_address/:id", verification, profile_helper.deleteAddress);



module.exports = Router;
