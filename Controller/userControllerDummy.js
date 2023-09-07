const express = require("express");
const Router = express.Router();
const verification = require("../Middleware/UserAuth");
const userHelper = require("../Helpers/user_helper");
const session = require("express-session");
const user_helper = require("../Helpers/user_helper");
const couponHelper = require("../Helpers/coupon_Helper");
const multer = require("multer"); // For handling file uploads
// const cartMiddleware = require("../Middleware/cartCount");

const userCartMiddleware = require("../Middleware/cart");

const { checkBlockedStatus } = require("../Middleware/checkBlockedStatus ");

const upload = multer({ dest: "uploads/" });
// Configure express-session
Router.use(
  session({
    secret: "mysecret",
    resave: false,
    saveUninitialized: false,
  })
);
// Configure express to parse request bodies
Router.use(express.urlencoded({ extended: true }));

Router.get("/", userHelper.home);

// Signup route
Router.get("/signup", (req, res) => {
  res.render("user/signup");
});
Router.post("/signup", userHelper.userSignup);
Router.get("/otp-verification", userHelper.otpVerification1);
Router.post("/resend-otp", userHelper.otpVerification2);
Router.post("/otp-verification", userHelper.otpVerification3);

//Login route
Router.get("/login", userHelper.userLogin);
//post login route
Router.post("/login", userHelper.login);
Router.get("/logout", verification, userHelper.logout);
Router.get(
  "/dashboard",
  verification,
  checkBlockedStatus,
  userHelper.dashboard
);
// Forgot Password route - Step 1
Router.get("/forgot-password", userHelper.forgetpassword1);
Router.post("/forgot-password", userHelper.forgetpassword2);
// Password Reset route - Step 2
Router.get("/reset-password/:token", userHelper.forgetpassword3);
Router.post("/reset-password/:token", userHelper.forgetpassword4);
Router.get("/search/products", verification, userHelper.searchProducts);
Router.get("/grid", verification, userHelper.gridView);
Router.get("/demo", verification, userHelper.demoView);
Router.get("/sorting", verification, userHelper.sorting);
Router.get("/filter-products", userHelper.filter);
Router.get("/myWallet", verification, userHelper.getWallet);
//!To View A Partcular Product when user click on a image
Router.get(
  "/product/:id",
  verification,
  checkBlockedStatus,
  userHelper.viewProduct
);
Router.get(
  "/product",
  verification,
  checkBlockedStatus,
  userHelper.viewProductErrormsg
);
Router.get(
  "/allproducts",
  verification,
  checkBlockedStatus,
  user_helper.viewallproducts
);
Router.get("/category/:id", verification, userHelper.categorywiseViewPrd);

//**COUPON MANAGEMENT */
// Route to view available coupons
Router.get("/coupons", couponHelper.viewCoupons);

//Review
Router.post(
  "/product/:id/review",
  upload.single("reviewImage"),
  userHelper.writeReview
);

Router.get("/checkReferralCode", userHelper.checkReferalCode);
module.exports = Router;
