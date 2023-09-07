const express = require("express");
const Router = express.Router();
const multer = require("multer"); // For handling file uploads
const Banner = require("../models/bannerModel");

// Set up multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/banners"); // Upload path
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });
// GET route for showing the add banner form
Router.get("/addBanner", (req, res) => {
  res.render("admin/addBanner"); 
  
});
// POST route for adding a new banner
Router.post("/addBanner", upload.single("image"), async (req, res) => {
  try {
    const { caption, link } = req.body;
    const imageUrl = `/banners/${req.file.filename}`; // Uploaded image path

    const newBanner = new Banner({
      imageUrl,
      caption,
      link,
    });

    await newBanner.save();

    res.redirect("/admin/dashBoard");
  } catch (error) {
    console.error(error);
    res.render("error"); // Render an error page if something goes wrong
  }
});

module.exports = Router;
