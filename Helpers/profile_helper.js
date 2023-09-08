const cartCollection = require("../models/cartModel");
const addressCollection = require("../models/addressModel");
const orderCollection = require("../models/orderModel");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const ObjectId = require("objectid");
const moment = require("moment");
const saltRounds = 10; // Number of salt rounds
module.exports = {
  viewProfile: async (req, res) => {
    const user = req.session.user;
    try {
      const userId = req.session.user._id;
      console.log("userId", userId);
      const userData = await User.findById(userId).lean();

      const orders = await orderCollection
        .find({ user: userId })
        .populate("cartItems.product")
        .sort({ _id: -1 })
        .limit(3)
        .lean();

      const ordersCount = await orderCollection.find().count();
      const cartCount = await cartCollection.find().count();
      res.render("user/profile", {
        userData,
        user,
        orders,
        ordersCount,
        cartCount: res.locals.cart_Count,
      });
    } catch (error) {
      console.log(error.message);
    }
  },
  viewUserProfile: async (req, res) => {
    const user = req.session.user;
    try {
      const userId = req.session.user._id;
      console.log("userId", userId);
      const userData = await User.findById(userId).lean();

      const orders = await orderCollection
        .find({ user: userId })
        .populate("cartItems.product")
        .lean();

      const ordersCount = await orderCollection.find().count();
      const cartCount = await cartCollection.find().count();
      res.render("user/userProfile", {
        userData,
        user,
        orders,
        ordersCount,
        cartCount: res.locals.cart_Count,
      });
    } catch (error) {
      console.log(error.message);
    }
  },
  editDetails: async (req, res) => {
    const user = req.session.user;
    try {
      const userId = req.session.user._id;
      const userData = await User.findById(userId).lean();
      res.render("user/editDetails", { userData, user });
    } catch (error) {
      console.log(error.message);
    }
  },
  updateProfile: async (req, res) => {
    const user = req.session.user;
    console.log("update profile");
    try {
      const userId = req.session.user._id;
      const { name, mobile } = req.body;
      console.log(mobile);
      // Check if the mobile number is in a valid format (example: 10 digits)
      if (!isValidMobileNumber(mobile)) {
        return res.send("Invalid mobile number format.");
      }
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          $set: {
            username: name,
            phoneNo: mobile,
          },
        },
        { new: true, upsert: true }
      );
      res.redirect("/profile/viewProfile");
    } catch (error) {
      console.log(error.message);
    }
  },
  uploadProPic: async (req, res) => {
    const userId = req.session.user._id;
    const profilePictureUrl = req.file ? req.file.path : null; // Set the profile picture URL based on the uploaded file
    // Find the user in the database based on the user ID
    const user = await User.findById(userId);
    // Update the user's profile picture URL
    if (profilePictureUrl) {
      user.profilePictureUrl = profilePictureUrl;
      await user.save();
    }
  },
  resetPassword: async (req, res) => {
    const user = req.session.user;
    res.render("user/resetPassword2", { user });
  },
  updatePassword: async (req, res) => {
    console.log(req.body);

    const userId = req.session.user._id;
    try {
      const user = await User.findById(userId);
      const { password } = req.body;

      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
      // Save the updated user to the database
      await user.save();
      console.log(user);
      res.redirect("/profile/viewProfile");
    } catch (error) {
      console.log(error.message);
    }
  },
  manageAddress: async (req, res) => {
    const user = req.session.user;
    const userId = user._id;
    const userAddresses = await addressCollection.find({ user: userId }).lean();
    res.render("user/manageAddress", { userAddresses, user });
  },
  editAddress: async (req, res) => {
    try {
      const userData = req.session.user;
      const addressId = req.params.id;

      const address = await addressCollection.findById(addressId).lean();
      // console.log("address", address);
      res.render("user/editAddress", { userData, address });
    } catch (error) {
      console.log(error.message);
    }
  },
  saveEditedAddress: async (req, res) => {
    try {
      const addressid = req.params.id;
      const id = req.session.user._id;
      const userData = await User.findById(id);
      const addressData = await addressCollection.findById(addressid);
      // Update the address fields
      addressData.fName = req.body.fname;
      addressData.mobile = req.body.mobile;
      addressData.address1 = req.body.address1;
      addressData.address2 = req.body.address2;
      addressData.city = req.body.city;
      addressData.state = req.body.state;
      addressData.postalCode = req.body.pin;

      // Save the changes
      await addressData.save();
      res.redirect("/profile/manageAddress");
    } catch (error) {
      console.log(error);
    }
  },
  deleteAddress: async (req, res) => {
    try {
      const id = req.params.id;
      console.log("Deleting address with ID:", id);
      const result = await addressCollection.findByIdAndDelete(id);

      if (!result) {
        console.log("Address not found.");
        return res.status(404).send("Address not found.");
      }

      console.log("Address deleted successfully.");
      res.redirect("/profile/manageAddress");
    } catch (error) {
      console.log(error);
    }
  },
};
// Function to validate the mobile number format (you can customize this function based on your requirements)
function isValidMobileNumber(mobileNumber) {
  // Assuming a valid mobile number should have 10 digits
  return /^\d{10}$/.test(mobileNumber);
}
