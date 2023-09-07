// Required dependencies
require("dotenv").config();
const express = require("express");
const connectDB = require("./config/connection");
const ObjectId = require("objectid");
const exphbs = require("express-handlebars");
const fs = require("fs");
const app = express();
const path = require("path");
const session = require("express-session");

const popularProductsMiddleware = require("./Middleware/most_popular_products");
const categoryMiddleware = require("./Middleware/categoryMiddleware");
const cartCountMiddleware = require("./Middleware/cartCount");

const cartController = require("./Controller/cartController");
const addressController = require("./Controller/AddressController");
const orderController = require("./Controller/OrderController");
const profileController = require("./Controller/profileController");
const UserOrdersController = require("./Controller/UserOrdersController");
const userControllerDummy = require("./Controller/userControllerDummy");
const adminControllerNew = require("./Controller/adminControllerNew");
const StripeController = require("./Controller/stripeController");
const walletPaymentController = require("./Controller/walletPaymentController");
const codPaymentController = require("./Controller/cashOnDeliveryController");
const bannerController = require("./Controller/bannerController");
const notificationController = require("./Controller/notificationController");
const whishlistController = require("./Controller/whishlistController");
const adminSalesDashBoardController = require("./Controller/adminSalesDashBoard");

const User = require("./models/userModel");
const handlebars = require("handlebars");
const handlebarsHelpers = require("handlebars-helpers");
const moment = require("moment");
handlebarsHelpers({ handlebars });

handlebars.registerHelper("for", function (from, to, incr, block) {
  let accum = "";
  for (let i = from; i <= to; i += incr) {
    accum += block.fn(i);
  }
  return accum;
});
handlebars.registerHelper("multiply", function (a, b) {
  return a * b;
});
handlebars.registerHelper("subtractDates", function (date1, date2) {
  const timestamp1 = new Date(date1).getTime();
  const timestamp2 = new Date(date2).getTime();
  return timestamp1 - timestamp2;
});
handlebars.registerHelper("isNumber", function (value, options) {
  if (typeof value === "number") {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});
handlebars.registerHelper("ne", function (a, b, options) {
  if (a !== b) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
}),
  handlebars.registerHelper("ifeq", function (a, b, options) {
    if (a == b) {
      return options.fn(this);
    }
    return options.inverse(this);
  });

handlebars.registerHelper("ifnoteq", function (a, b, options) {
  if (a != b) {
    return options.fn(this);
  }
  return options.inverse(this);
});

handlebars.registerHelper("ifEquals", function (arg1, arg2, options) {
  return arg1 === arg2 ? options.fn(this) : options.inverse(this);
});
handlebars.registerHelper(
  "paginationNumbers",
  function (currentPage, totalPages) {
    const range = 3; // Number of pages to show before and after the current page
    const start = Math.max(1, currentPage - range);
    const end = Math.min(totalPages, currentPage + range);

    const paginationNumbers = [];
    for (let i = start; i <= end; i++) {
      paginationNumbers.push(i);
    }

    return paginationNumbers;
  }
);
handlebars.registerHelper("formatDate", function (date) {
  return moment(date).format("DD-MM");
});
// Define your getStatusColorClass function here
const getStatusColorClass = (status) => {
  switch (status) {
    case "cancelled":
      return "red-status";
    case "confirmed":
      return "blue-status";
    case "pending":
      return "yellow-status";
    case "delivered":
      return "green-status";
    case "returned":
      return "green-status";
    default:
      return "status";
  }
};

handlebars.registerHelper("statusColorClass", getStatusColorClass);
handlebars.registerHelper("formatDate2", function (date) {
  if (!date) {
    return "N/A";
  }
  return date.toLocaleString([], {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
});

// Define  Handlebars helper function
handlebars.registerHelper("dynamicImageURL", function (index) {
  return `/uploads/images/category${index + 1}.jpg`;
});

handlebars.registerHelper("isFirstBanner", function (index, options) {
  if (index === 0) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});

handlebars.registerHelper(
  "progressBarClass",
  function (status, expectedStatus, options) {
    return status === expectedStatus ? "green" : "text-muted";
  }
);

handlebars.registerHelper("range", function (start, end) {
  const result = [];
  for (let i = start; i <= end; i++) {
    result.push(i);
  }
  return result;
});
handlebars.registerHelper("floor", function (value) {
  return Math.floor(value);
});
handlebars.registerHelper("ceil", function (value) {
  return Math.ceil(value);
});

handlebars.registerHelper("renderStars", function (averageRating) {
  const starsHTML = [];
  const fullStars = Math.floor(averageRating);
  const halfStar = averageRating - fullStars >= 0.5;

  for (let i = 1; i <= 5; i++) {
    if (i <= fullStars) {
      starsHTML.push('<i class="fas fa-star"></i>');
    } else if (i === fullStars + 1 && halfStar) {
      starsHTML.push('<i class="fas fa-star-half"></i>');
    } else {
      starsHTML.push('<i class="far fa-star"></i>');
    }
  }

  return new handlebars.SafeString(starsHTML.join(""));
});

// Configure the view engine
app.set("view engine", "hbs");
app.set("views", __dirname + "/views");

app.use(express.urlencoded({ extended: true }));
// Configure express-session
app.use(
  session({
    secret: "mysecret",
    resave: false,
    saveUninitialized: false,
  })
);
app.use((req, res, next) => {
  if (req.session.user) {
    // User is logged in, fetch cartCount
    cartCountMiddleware.getAllCartCount(req, res, next);
  } else {
    // User is not logged in, proceed without cartCount
    next();
  }
});
// Configure the view engine
app.engine(
  "hbs",
  exphbs.engine({
    extname: ".hbs",
    defaultLayout: false, // If you don't have a layout, set this to false
    partialsDir: path.join(__dirname, "views/partials"),
  })
);

// Register the category middleware to be used for all routes
app.use(categoryMiddleware.getAllCategories);
app.use(popularProductsMiddleware.getPopularProducts);

//ROUTES
app.use("/admin", adminControllerNew);
app.use("/cart", cartController);
app.use("/address", addressController);
app.use("/order", orderController);
app.use("/profile", profileController);
app.use("/admin/UserOrders", UserOrdersController);
app.use("/", userControllerDummy);
app.use("/stripe", StripeController);
app.use("/cod", codPaymentController);
app.use("/wallet", walletPaymentController);
app.use("/admin/banner", bannerController);
app.use("/admin/notifications", notificationController);
app.use("/wishlist", whishlistController);
app.use("/admin/salesReport", adminSalesDashBoardController);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/Bootstrap", express.static(path.join(__dirname, "/Bootstrap")));

connectDB();

// Function to generate a random referral code
// function generateReferralCode() {
//   const length = 6;
//   const characters =
//     "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
//   let code = "";
//   for (let i = 0; i < length; i++) {
//     const randomIndex = Math.floor(Math.random() * characters.length);
//     code += characters[randomIndex];
//   }
//   return code;
// }

// Update existing users with referral codes
// async function assignReferralCodes() {
//   try {
//     const users = await User.find();
//     for (const user of users) {
//       if (!user.referralCode) {
//         user.referralCode = generateReferralCode();
//         await user.save();
//         console.log(
//           `Referral code assigned for user ${user.username}: ${user.referralCode}`
//         );
//       }
//     }
//   } catch (error) {
//     console.error("Error assigning referral codes:", error);
//   }
// }
// assignReferralCodes();
const serverPort = process.env.SERVER_PORT;
// Start the server
app.listen(serverPort, () => {
  console.log("Server listening on port 3000 1");
});
