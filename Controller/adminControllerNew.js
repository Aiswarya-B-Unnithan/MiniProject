const express = require("express");
const Router = express.Router();
const multer = require("multer");
const session = require("express-session");
const bodyParser = require("body-parser");
const { checkBlockedStatus } = require("../Middleware/checkBlockedStatus ");

const admin_Product_Management_Helper = require("../Helpers/Admin_Helpers/adminProduct_Mangagement_Helper");
const category_management_helper = require("../Helpers/Admin_Helpers/category_management_helper");
const user_management_helper = require(".././Helpers/Admin_Helpers/user_management_helper");
const isAdmin = require("../Middleware/adminAuth");
const couponManagementHelper = require("../Helpers/Admin_Helpers/coupon_Management_Helper");
const offerManagementHelper = require("../Helpers/Admin_Helpers/offerManagementHelper");
// Configure express-session
Router.use(
  session({
    secret: "mysecret",
    resave: false,
    saveUninitialized: false,
  })
);
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
// Increase the payload size limit to 50MB
Router.use(bodyParser.json({ limit: "50mb" }));
Router.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// Configure express to parse request bodies
Router.use(express.urlencoded({ extended: true }));

//* Admin sign-in route
Router.get("/login", admin_Product_Management_Helper.getLogin);
Router.post("/login", admin_Product_Management_Helper.postLogin);
//*Logout Admin
Router.get("/logout", admin_Product_Management_Helper.logout);

//*PRODUCT MANAGEMENT//
// Get all products
Router.get(
  "/products",
  isAdmin,
  admin_Product_Management_Helper.getProductsPage
);
// Add a new product
Router.get(
  "/add-product",
  isAdmin,
  admin_Product_Management_Helper.GetAddProductPage
);
Router.get("/dashBoard", isAdmin, admin_Product_Management_Helper.DashBorad);

//*ADD A NEW PRODUCT
Router.post(
  "/add-product",
  isAdmin,
  upload.array("file", 5),
  admin_Product_Management_Helper.AddProduct
);
//*Edit product
Router.get(
  "/update-Product/:id",
  isAdmin,
  admin_Product_Management_Helper.GetEditProductPage
);
//* POST route to update the product details
Router.post(
  "/update-Product/:id",
  upload.array("file", 5),
  isAdmin,
  admin_Product_Management_Helper.PostEditProductPage
);
//*Search Products
Router.get("/search", isAdmin, admin_Product_Management_Helper.Serach);
//*Delete Product
Router.get(
  "/delete-Product/:id",
  isAdmin,
  admin_Product_Management_Helper.DeleteProduct
);

//*CATEGORY MANAGEMNET//
Router.get(
  "/categories",
  isAdmin,
  category_management_helper.Get_Category_Page
);
Router.get(
  "/add-categories",
  isAdmin,
  category_management_helper.get_Add_categorypage
);
Router.post(
  "/add-categories",
  isAdmin,
  category_management_helper.post_new_category
);
//*UPDATE CATEGORY
Router.get(
  "/update-category/:id",
  isAdmin,
  category_management_helper.Update_Category_Page
);
Router.post(
  "/update-category/:id",
  isAdmin,
  category_management_helper.Post_Update_Category_Page
);
//*DELETE A CATEGORY
Router.get(
  "/delete-category/:id",
  isAdmin,
  category_management_helper.Delete_category
);
//* User management route
Router.get("/users", isAdmin, user_management_helper.Get_All_Users);
//* Block/unblock user route
Router.post(
  "/users/:userId/block",
  isAdmin,
  checkBlockedStatus,
  user_management_helper.Block_User
);

Router.get("/addCoupon", isAdmin, couponManagementHelper.getaddCouponPage);
Router.post("/addCoupon", isAdmin, couponManagementHelper.addCoupon);
Router.get("/viewCoupon", isAdmin, couponManagementHelper.viewCoupons);

//Offer Management
Router.get("/viewOffers", isAdmin, offerManagementHelper.viewOffers);
Router.post("/add-offer", isAdmin, offerManagementHelper.addNewOffer);
module.exports = Router;
