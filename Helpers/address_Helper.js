const addressCollection = require("../models/addressModel");
const mongoose = require("mongoose");
// const ObjectId = require("mongoose").Types.ObjectId;
const ObjectId = mongoose.Types.ObjectId;
const User = require("../models/userModel");
const cartCollection = require("../models/cartModel");
const couponCollection = require("../models/couponModel");
const productCollection = require("../models/productModel");
const categoryCollection = require("../models/categoryModel");

let availableCoupons = [];
let discountAmount = 0;
let discountOnMRP = 0;
module.exports = {
  viewAddress: async (req, res) => {
    try {
      const userId = req.session.user._id;
      const user = req.session.user;
      const fromCart = req.query.fromCart === "true";
      const cart = cartCollection.findById(userId).populate("items.product");
      // Find all addresses for the logged-in user
      console.log(userId);
      const addresses = await addressCollection.find({ user: userId }).lean();
      res.render("user/address", { addresses, user, cart, fromCart });
    } catch (error) {
      res.render("user/address", { error: "Something Went Wrong" });
    }
  },

  addAddress: async (req, res) => {
    try {
      const user = req.session.user;

      // Render the add-address.hbs view to allow the user to add a new address
      res.render("user/addAddress", { user });
    } catch (error) {
      console.log("Error rendering add address page:", error);
      res.render("user/addAddress", {
        error: "Error rendering add address page",
      });
    }
  },
  Add_New_Address: async (req, res) => {
    try {
      const user = req.session.user;
      // Render the add-address.hbs view to allow the user to add a new address
      res.render("user/add_New_Address", { user });
    } catch (error) {
      console.log("Error rendering add address page:", error);
      res.render("user/add_New_Address", {
        error: "Error rendering add address page",
      });
    }
  },
  save_new_address: async (req, res) => {
    console.log("saving");
    try {
      const userId = req.session.user._id;
      const {
        fname,
        lname,
        email,
        address1,
        address2,
        city,
        state,
        postalCode,
      } = req.body;

      console.log(fname, lname, email);
      const newAddress = new addressCollection({
        user: userId,
        fName: fname,
        lName: lname,
        email: email,
        address1: address1,
        address2: address2,
        city: city,
        state: state,
        postalCode: postalCode,
      });

      await newAddress.save();
      res.redirect("/profile/manageAddress");
    } catch (error) {
      console.log(error.message);
    }
  },

  saveAddress: async (req, res) => {
    try {
      const userId = req.session.user._id;
      const { fname, lname, email, address1, address2, city, state, pincode } =
        req.body;

      const newAddress = new addressCollection({
        user: userId,
        fName: fname,
        lName: lname,
        email: email,
        address1: address1,
        address2: address2,
        city: city,
        state: state,
        postalCode: pincode,
      });

      await newAddress.save();
      res.render("user/checkout", { fname, lname });
    } catch (error) {
      console.log(error);
    }
  },
  showPaymentPage: async (req, res) => {
    const user = req.session.user;
    try {
      const userId = req.session.user._id;
      // Get the selected address ID from the query parameters
      const selectedAddressId = req.params.id;

      const selectedAddress = await addressCollection
        .findById(selectedAddressId)
        .lean();

      //Finding the address selected by user
      req.session.deleveryAddressId = selectedAddressId;
      console.log("selAddId", selectedAddressId);
      // Find the user's cart
      const cart = await cartCollection
        .findOne({ user: userId })
        .lean()
        .populate("items.product")
        .lean()
        .exec();

      if (cart && cart.items.length > 0) {
        // Calculate the total price of all items in the cart
        const totalPrice = cart.items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
        res.render("user/payment", {
          shippingAddress: selectedAddress,
          cart: cart,
          totalPrice: totalPrice,
          user,
        });
      }
    } catch (error) {
      console.error("Error fetching address:", error);
    }
  },
  showAddress: async (req, res) => {
    try {
      const user = req.session.user;
      const userId = req.session.user._id;
      const totalAmountWithTax = parseFloat(req.query.totalAmountWithTax);
      const couponCode = req.query.selectedCoupon;
      discountAmount = req.query.discountPercent;
      discountOnMRP = req.query.discountOnMRP;
      req.session.discountOnMRP = discountOnMRP;
      console.log("discountAmountt", discountAmount);
      const userCart = await cartCollection
        .findOne({ user: userId })
        .populate("items.product")
        .lean();
      req.session.userCartId = userCart._id;
      const productCategories = userCart.items.map(
        (item) => item.product.category
      );

      // Collect all unique category names from the products
      const uniqueCategories = [...new Set(productCategories)];
      const productsInCategories = await productCollection
        .find({
          category: { $in: uniqueCategories },
        })
        .lean();
      const categories = await categoryCollection
        .find({ _id: { $in: uniqueCategories } })
        .lean();

      const categoryNames = categories.map((category) => category.name);
      // Get all available coupons from all unique categories

      let addresses = await addressCollection.find({ user: userId }).lean();
      console.log("addresses", addresses);
      if (userCart && userCart.items.length > 0) {
        // Calculate the total price of all items in the cart
        const totalPrice = userCart.items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );

        res.render("user/checkout", {
          addresses,
          user,
          userCart,
          totalAmountWithTax,
          couponCode,
          discountAmount,
        });
      }
    } catch (error) {
      console.log(error.message);
      res.render("user/checkout", { error: error.message });
    }
  },

  addCheckOutAddress: async (req, res) => {
    const userId = req.session.user._id;
    const totalAmountWithTax = req.body.totalAmountWithTax;
    console.log("req.body", req.body);
    const {
      fname,
      lname,
      mobile,
      email,
      address1,
      address2,
      city,
      state,
      postalCode,
    } = req.body;
    const newCheckOutAddress = new addressCollection({
      user: userId,
      fName: fname,
      lName: lname,
      email: email,
      mobile: mobile,
      address1: address1,
      address2: address2,
      city: city,
      state: state,
      postalCode: postalCode,
    });
    await newCheckOutAddress.save();
    res.redirect(`/address/checkout?totalAmountWithTax=${totalAmountWithTax}`);
  },
  fetchAddress: async (req, res) => {
    try {
      const cursor = await addressCollection.find();
      const addresses = [];

      await cursor.forEach((address) => {
        addresses.push(address); // Push each document to the array
      });

      console.log("addresses:", addresses);
      res.json(addresses);
    } catch (error) {
      console.error("Error fetching addresses:", error);
      res.status(500).json({ error: "An error occurred" });
    }
  },
  fetchAddressById: async (req, res) => {
    const addressId = req.query.addressId;

    const address = await addressCollection.findOne({ addressId }).lean();
    res.json({ address });
  },
  showConformationPage: async (req, res) => {
    const user = req.session.user;
    const discountedTotal = req.query.discountedTotal;
    const cartTotal = req.query.subTotal;
    const selectedCoupon = req.query.selectedCoupon;
    const CouponDiscountAmount = req.query.CouponDiscountAmount;
    const selectedAddressId = req.query.addressId;

    //Saving coupon Code and amount to session
    req.session.user.selectedCoupon = selectedCoupon;
    // req.session.user.discountedAmount = discountedAmount;

    console.log("from placeOrder", selectedAddressId);
    //stroring selectedAddressId to session
    req.session.selectedAddressId = selectedAddressId;
    console.log("add address id to session", req.session.selectedAddressId);

    console.log("discountedTotal", discountedTotal);
    let userId = req.session.user._id;
    // userId = ObjectId("userId");
    console.log(userId);
    try {
      // Fetch cart details and available payment methods here
      const cart = await cartCollection
        .findOne({ user: userId })
        .populate("items.product")
        .lean();

      console.log(cart);
      //Find the address
      const address = await addressCollection.findById(selectedAddressId);
      // Render the confirmation page and pass data
      res.render("user/confirmation", {
        cart,
        cartTotal,
        discountedTotal,
        CouponDiscountAmount,
        paymentMethods: ["Cash on Delivery", "Wallet", "StripePayment"],
        user, // Example payment methods
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching cart details" });
    }
  },
  saveEditedAddress: async (req, res) => {
    try {
      const addressid = req.params.id;
      // console.log("Line150addressid", addressid);
      const id = req.session.user._id;
      const userData = await User.findById(id);
      const addressData = await addressCollection.findById(addressid);
      // console.log("addressData", addressData);
      // console.log("req.body", req.body);
      const {
        fName,
        lName,
        email,
        mobile,
        address1,
        address2,
        city,
        state,
        postalCode,
      } = req.body;
      console.log(fName, lName, email);
      // Update the address fields
      addressData.fName = fName;
      addressData.lName = lName;
      addressData.mobile = mobile;
      addressData.address1 = address1;
      addressData.address2 = address2;
      addressData.city = city;
      addressData.state = state;
      addressData.postalCode = postalCode;

      // Save the changes
      await addressData.save();
      await res.send(JSON.stringify(addressData));
      // res.redirect("/address/checkout");
    } catch (error) {
      console.log(error);
    }
  },
  fetchEditAddressById: async (req, res) => {
    const addressId = req.params.id;
    console.log("Received request parameters:", req.params);
    console.log("addressId", addressId);
    const address = await addressCollection.findOne({ _id: addressId }).lean();
    console.log("address", address);
    await res.json({ address });
  },
};
