const categoryCollection = require("../models/categoryModel");
const UserCollection = require("../models/userModel");
const productCollection = require("../models/productModel");
const offerCollection = require("../models/offerModel");
const banners = require("../models/bannerModel");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const handlebars = require("handlebars");
const handlebarsHelpers = require("handlebars-helpers");
const nodemailer = require("nodemailer");
const reviewCollection = require("../models/reviewModel");
const WalletTransactionCollection = require("../models/walletTransactionModel");
const password = process.env.EMAIL_PASSWORD;

handlebarsHelpers({ handlebars });
handlebars.registerHelper("eachArray", function (context, options) {
  var ret = "";
  for (var i = 1; i <= context; i++) {
    ret = ret + options.fn(i);
  }
  return ret;
});
let referringUser = {};
let newlyUser = {};
module.exports = {
  home: async (req, res) => {
    const user = req.session.user;
    let mainImages = [];
    let Banners = [];
    try {
      Banners = await banners.find().lean();

      productCollection
        .find({ deleted: false })
        .lean()
        .populate("category")
        .lean()
        .then((products) => {
          products.map((product) => {
            // Set the first image as the main image if there are images, otherwise set it to an empty string
            return (mainImages = [
              ...mainImages,
              product.images.length > 0 ? product.images[0] : "",
            ]);
          });

          categoryCollection
            .find({ deleted: false })
            .lean()
            .then((categories) => {
              res.render("user/Home", {
                products,
                user,
                categories,
                mainImages,
                Banners,
              });
            });
        })
        .catch((error) => {
          console.log("Error fetching products:", error);
          res.render("user/Home", { error: "Error fetching products" });
        });
    } catch (error) {
      console.log(error);
    }
  },

  userSignup: async (req, res) => {
    const { username, password, email, mobile, referralCode } = req.body;
    req.session.username = username;
    req.session.password = password;
    req.session.mobile = mobile;
    req.session.email = email;
    req.session.referralCode = referralCode;
    console.log("referralCode", referralCode);
    // Validate inputs (add more validation as needed)
    if (!username || !password || !email) {
      return res.render("signup", { error: "All fields are required" });
    }

    try {
      // Check if the user already exists
      const existingUser = await UserCollection.findOne({
        $or: [{ username }, { email }],
      });
      if (existingUser) {
        console.log("Username or email already exists");
        // User with the same username or email already exists
        return res.render("user/signup", {
          messageErr: "Username or email already exists",
        });
      }

      // Generate OTP
      const otp = generateOTP();

      const otpExpiration = new Date(Date.now() + 1 * 600000); // OTP expires in 5 minutes

      // Store OTP in session (temporary storage)
      req.session.tempOTP = { otp, otpExpiration };
      // Create a Nodemailer transporter using your Gmail credentials
      const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: "eshoptoday.001.in@gmail.com",
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      const mailOptions = {
        from: "eshoptoday.001.in@gmail.com",
        to: email,
        subject: "OTP Verification",
        text: `Your OTP is: ${otp}`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log("Error sending email:", error);
        } else {
          console.log("Email sent:", info.response);
        }
      });

      // Redirect to OTP verification
      res.redirect(`/otp-verification?referralCode=${referralCode}`);
    } catch (error) {
      console.log("Error signing up:", error);
      res.render("user/signup", { messageErr: "Error signing up" });
    }
  },
  otpVerification1: async (req, res) => {
    const referralCode = req.query.referralCode;
    console.log("referralCodde", referralCode);
    // Check if the user has the temporary OTP stored in session
    if (
      !req.session.tempOTP ||
      !req.session.tempOTP.otp ||
      !req.session.tempOTP.otpExpiration
    ) {
      return res.render("user/otp-verification", {
        error: "Invalid or expired OTP. Resend again.",
      });
    }
    res.render("user/otp-verification", {
      message: "Email sent to your email address",
      referralCode,
    });
  },
  otpVerification2: async (req, res) => {
    var email = req.session.email;
    // Generate a new OTP
    const newOtp = generateOTP();
    console.log(newOtp);
    const otpExpiration = new Date(Date.now() + 1 * 600000); // OTP expires in 1 minutes

    // Update the temporary OTP in session
    req.session.tempOTP = {
      otp: newOtp,
      otpExpiration,
    };

    try {
      // Create a Nodemailer transporter using your Gmail credentials
      const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: "eshoptoday.001.in@gmail.com",
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      const mailOptions = {
        from: "eshoptoday.001.in@gmail.com",
        to: email,
        subject: "OTP Verification",
        text: `Your new OTP is: ${newOtp}`,
      };

      // transporter.sendMail(mailOptions, (error, info) => {
      //   if (error) {
      //     console.log("Error sending email:", error);
      //   } else {
      //     console.log("Email sent:", info.response);
      //     res.render("user/otp-verification", { message: "Otp resend" });
      //   }
      // });
    } catch (error) {
      console.log("Error resending OTP:", error);
      res.status(500).json({ error: "Error resending OTP" });
    }
  },
  otpVerification3: async (req, res) => {
    const { email, otp, referralCode } = req.body;

    console.log("referralCodee", referralCode);
    // Check if the user has the temporary OTP stored in session
    if (
      !req.session.tempOTP ||
      !req.session.tempOTP.otp ||
      !req.session.tempOTP.otpExpiration
    ) {
      return res.render("user/otp-verification", {
        messageErr: "Invalid or expired OTP. Register again.",
      });
    }

    // Check if the entered OTP matches the temporary OTP
    if (otp !== req.session.tempOTP.otp) {
      return res.render("user/otp-verification", {
        messageErr: "Incorrect OTP. Register again.",
      });
    }

    // Check if the OTP has expired
    if (new Date() > new Date(req.session.tempOTP.otpExpiration)) {
      return res.render("user/otp-verification", {
        messageErr: "OTP has expired. Register again.",
      });
    }

    // Clear the temporary OTP data from session
    delete req.session.tempOTP;
    const generatedReferralCode = generateReferralCode(
      req.session.username,
      email
    );
    // Create a new user
    const newUser = new UserCollection({
      username: req.session.username,
      password: bcrypt.hashSync(req.session.password, 10),
      email,
      phoneNo: req.session.mobile,
      referralCode: generatedReferralCode,
    });
    await newUser.save().then(async (userData) => {
      if (referralCode) {
        referringUser = await UserCollection.findOneAndUpdate(
          { referralCode: referralCode },
          { $inc: { wallet: 500 } }, // Increment wallet balance by 500
          { new: true }
        );

        if (referringUser) {
          console.log("Referring user:", referringUser);
          newlyUser = await UserCollection.findOneAndUpdate(
            { email: email },
            { $inc: { wallet: 100 } },
            { new: true }
          );
          // Handle success or response here
        } else {
          console.log("Invalid referral code");
          // Handle invalid referral code here
        }
      }
    });

    // Create a wallet transaction record for the referring user
    if (referringUser) {
      const referringUserId = referringUser._id;
      const walletTransactionReferringUser = new WalletTransactionCollection({
        user: referringUserId,
        type: "credit",
        amount: 500,
        description: "Referral Bonus",
      });
      // Save the wallet transaction record for the referring user
      await walletTransactionReferringUser.save();
      // Create a wallet transaction record for the newly created user
      const newlyUserId = newlyUser._id;
      const walletTransactionNewlyUser = new WalletTransactionCollection({
        user: newlyUserId,

        type: "credit",
        amount: 100,
        description: "Initial Wallet Bonus",
      });
      // Save the wallet transaction record for the newly created user
      await walletTransactionNewlyUser.save();
    }

    res.render("user/login");
  },
  userLogin: async (req, res) => {
    const user = req.session.user;
    if (!user) {
      return res.render("user/login");
    } else {
      return res.redirect("/dashboard");
    }
  },
  login: async (req, res) => {
    const { username, password } = req.body;

    const categories = await categoryCollection.find({ deleted: false });
    // Find the user in the database
    UserCollection.findOne({ username })
      .then((user) => {
        if (!user || user.blocked) {
          // User not found
          return res.render("user/login", {
            message: "User not found or blocked",
            categories,
          });
        }

        // Compare passwords
        if (!bcrypt.compareSync(password, user.password)) {
          // Incorrect password

          return res.render("user/login", {
            message: "Unauthorised access",
            categories,
          });
        }

        // Successful login
        req.session.user = user;
        res.redirect("/dashboard");
      })
      .catch((error) => {
        console.log("Error logging in:", error);
        res.render("user/login", { message: "Error logging in" });
      });
  },

  logout: async (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.log("Error logging out:", err);
      }
      res.redirect("/login");
    });
  },
  dashboard: async (req, res) => {
    const user = req.session.user;
    let mainImages = [];
    if (!user) {
      return res.redirect("/login");
    }
    try {
      const PAGE_SIZE = 10; // Number of items per page
      const page = parseInt(req.query.page, 10) || 1;
      const totalProducts = await productCollection.countDocuments();
      const totalPages = Math.ceil(totalProducts / PAGE_SIZE);
      const skip = (page - 1) * PAGE_SIZE;

      const products = await productCollection
        .find({ deleted: false })
        .lean()
        .populate("category")
        .lean()
        .sort({ productName: 1 })
        .skip(skip)
        .limit(PAGE_SIZE)
        .lean();

      products.map((product) => {
        // Set the first image as the main image if there are images, otherwise set it to an empty string
        return (mainImages = [
          ...mainImages,
          product.images.length > 0 ? product.images[0] : "",
        ]);
      });
      const categories = await categoryCollection
        .find({ deleted: false })
        .lean();

      const offers = await offerCollection.find().lean();

      // Calculate offer prices for products
      const productsWithOffer = products.map((product) => {
        const categoryOffer = offers.find(
          (offer) =>
            product.category && offer.category === product.category.name
        );

        if (categoryOffer) {
          const offerPrice =
            product.price -
            (product.price * categoryOffer.discountPercentage) / 100;
          return { ...product, offerPrice };
        } else {
          return { ...product };
        }
      });
      // Loop through productsWithOffer and update the database
      for (const product of productsWithOffer) {
        // Assuming product._id is the ObjectId of the product document
        await productCollection.updateOne(
          { _id: product._id },
          { $set: { offerPrice: product.offerPrice } }
        );
      }
      const productsWithAverageRating = await Promise.all(
        productsWithOffer.map(async (product) => {
          const reviews = await reviewCollection
            .find({ product: product._id })
            .lean();
          const totalRating = reviews.reduce(
            (sum, review) => sum + review.rating,
            0
          );
          const avgRating =
            reviews.length > 0 ? totalRating / reviews.length : 0;

          return { ...product, avgRating };
        })
      );

      res.render("user/Userdashboard", {
        products: productsWithAverageRating,
        user,
        categories,
        mainImages,
        currentPage: page,
        totalPages: totalPages,
        itemsPerPage: PAGE_SIZE,
        cartCount: res.locals.cart_Count,
      });
    } catch (error) {
      console.log("error", error.message);
    }
  },
  forgetpassword1: async (req, res) => {
    res.render("user/forget_Password");
  },
  forgetpassword2: async (req, res) => {
    const { email } = req.body;
    try {
      // Check if the user exists with the provided email
      const user = await UserCollection.findOne({ email });
      //console.log(user);
      if (!user) {
        return res.render("forgotPassword", {
          messageErr: "User with this email does not exist",
        });
      }
      // Generate a unique reset token
      const resetToken = crypto.randomBytes(32).toString("hex");
      // Set the reset token and expiration time for the user
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpiration = Date.now() + 3600000; // Token expires in 1 hour
      // Save the user with the reset token and expiration time
      await user.save();
      // Send the password reset email to the user
      const resetLink = `${req.protocol}://${req.get(
        "host"
      )}/reset-password/${resetToken}`;
      //console.log(resetLink);

      // Create a Nodemailer transporter using your Gmail credentials
      const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: "eshoptoday.001.in@gmail.com",
          pass: process.env.EMAIL_PASSWORD,
        },
      });
      const mailOptions = {
        from: "eshoptoday.001.in@gmail.com",
        to: email,
        subject: "Password Reset Request",
        text: `You have requested a password reset. Please click on the link below to reset your password:\n\n${resetLink}`,
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log("Error sending email:", error);
        } else {
          console.log("Email sent:", info.response);
        }
      });

      // Redirect to the password reset confirmation page
      res.render("user/forget_Password", {
        //   categories,
        message: "Email sent to your email id",
      });
    } catch (error) {
      console.log("Error sending password reset email:", error);
      res.render("user/forget_Password", {
        messageErr: "Error sending password reset email",
      });
    }
  },
  forgetpassword3: async (req, res) => {
    const { token } = req.params;
    try {
      // Find the user with the provided reset token
      const user = await UserCollection.findOne({
        resetPasswordToken: token,
        resetPasswordExpiration: { $gt: Date.now() },
      });
      if (!user) {
        return res.render("user/reset_password", {
          messageErr: "Invalid or expired reset token. Please try again.",
        });
      }
      // Render the password reset page with the reset token
      res.render("user/reset_password", { token });
    } catch (error) {
      console.log("Error finding user with reset token:", error);
      res.render("user/reset_password", {
        messageErr: "Error finding user with reset token",
      });
    }
  },
  forgetpassword4: async (req, res) => {
    const { newPassword } = req.body;
    try {
      const resetToken = req.params.token;

      // Find the user with the reset token
      const user = await UserCollection.findOne({
        resetPasswordToken: resetToken,
      });

      if (!user) {
        return res.render("resetPassword", {
          messageErr: "Invalid or expired reset token",
        });
      }

      // Check if the reset token has expired
      if (Date.now() > user.resetPasswordExpiration) {
        return res.render("resetPassword", {
          messageErr: "Reset token has expired",
        });
      }

      // Update the user's password with the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;

      // Clear the reset token and expiration time
      user.resetPasswordToken = undefined;
      user.resetPasswordExpiration = undefined;

      // Save the updated user to the database
      await user.save();

      res.render("user/login", {
        message:
          "Password reset successful. You can now log in with your new password.",
      });
    } catch (error) {
      console.log("Error resetting password:", error);
      res.render("resetPassword", { messageErr: "Error resetting password" });
    }
  },
  //search Products
  searchProducts: async (req, res) => {
    let mainImages = [];

    if (!req.session.user) {
      console.log("ok");
      return res.redirect("/login");
    }
    const user = req.session.user;
    try {
      const PAGE_SIZE = 10; // Number of items per page

      const page = parseInt(req.query.page, 10) || 1;
      const totalProducts = await productCollection.countDocuments();
      const totalPages = Math.ceil(totalProducts / PAGE_SIZE);
      const skip = (page - 1) * PAGE_SIZE;

      const productName = req.query.search;
      const categoryId = req.query.category;

      // Create a query object to filter products based on search parameters
      const query = { deleted: false };

      if (productName) {
        query.productName = { $regex: productName, $options: "i" };
      }

      if (categoryId) {
        query.category = categoryId;
      }
      // Fetch products from the database based on the query
      const products = await productCollection
        .find(query)
        .lean()
        .populate("category")
        .lean()
        .sort({ productName: 1 })
        .skip(skip)
        .limit(PAGE_SIZE)
        .exec();
      products.map((product) => {
        // Set the first image as the main image if there are images, otherwise set it to an empty string
        return (mainImages = [
          ...mainImages,
          product.images.length > 0 ? product.images[0] : "",
        ]);
      });
      const categories = await categoryCollection
        .find({ deleted: false })
        .lean();

      res.render("user/seachItems", {
        products,
        categories,
        user,
        mainImages,
        totalPages: totalPages,
        itemsPerPage: PAGE_SIZE,
      });
    } catch (error) {
      console.log("Error fetching products:", error);
      res.render("user/seachItems", {
        messageErr: "Error fetching products",
        user,
      });
    }
  },
  viewProduct: async (req, res) => {
    const user = req.session.user;
    if (!user) {
      return res.redirect("/login");
    }
    const productId = req.params.id;

    try {
      // Fetch the product from the database based on the product ID
      const product = await productCollection
        .findById(productId)
        .lean()
        .populate("category")
        .lean();
      if (!product) {
        // If the product is not found, handle the error and render an appropriate error page
        return res.render("user/error", { messageErr: "Product not found" });
      }

      const [firstImage] = product.images;

      //fetching reviews from db
      const reviews = await reviewCollection
        .find({ product: productId })
        .lean();

      let totalRating = 0;
      for (const review of reviews) {
        totalRating += review.rating;
      }

      const averageRating =
        reviews.length > 0 ? totalRating / reviews.length : 0;
      const floorAverageRating = Math.floor(averageRating);
      const showHalfStar = averageRating - floorAverageRating >= 0.5;

      const stars = Array.from({ length: 5 }).map((_, index) => {
        return {
          index,
          isHalfStar: showHalfStar && index === floorAverageRating,
        };
      });

      // Render the product details page and pass the product data to the template
      res.render("user/productDetails", {
        product,
        user,
        firstImage,
        reviews,
        averageRating,
        floorAverageRating,
        showHalfStar,
        stars,
        cartCount: res.locals.cart_Count,
      });
    } catch (error) {
      console.error("Error fetching product details:", error);
      // Handle the error and render an appropriate error page
      res.render("user/error", {
        messageErr: "Error fetching product details",
      });
    }
  },
  categorywiseViewPrd: async (req, res) => {
    const user = req.session.user;
    let mainImages = [];
    if (!user) {
      return res.redirect("/login");
    }

    try {
      const categoryId = req.params.id;
      const PAGE_SIZE = 6; // Number of items per page
      const page = parseInt(req.query.page, 6) || 1;
      const totalProducts = await productCollection.countDocuments();
      const totalPages = Math.ceil(totalProducts / PAGE_SIZE);
      const skip = (page - 1) * PAGE_SIZE;

      // Fetch products under the specified category from the database
      const products = await productCollection
        .find({ category: categoryId })
        .lean()
        .populate("category")
        .lean()
        .sort({ name: 1 })
        .skip(skip)
        .limit(PAGE_SIZE)
        .exec();

      // // You can also fetch the category name separately if you need it
      // const category = await category.findById(categoryId);

      products.map((product) => {
        // Set the first image as the main image if there are images, otherwise set it to an empty string
        return (mainImages = [
          ...mainImages,
          product.images.length > 0 ? product.images[0] : "",
        ]);
      });
      const offers = await offerCollection.find().lean();

      // Calculate offer prices for products
      const productsWithOffer = products.map((product) => {
        const categoryOffer = offers.find(
          (offer) =>
            product.category && offer.category === product.category.name
        );

        if (categoryOffer) {
          const offerPrice =
            product.price -
            (product.price * categoryOffer.discountPercentage) / 100;
          return { ...product, offerPrice };
        } else {
          return { ...product };
        }
      });

      const productsWithAverageRating = await Promise.all(
        productsWithOffer.map(async (product) => {
          const reviews = await reviewCollection
            .find({ product: product._id })
            .lean();
          const totalRating = reviews.reduce(
            (sum, review) => sum + review.rating,
            0
          );
          const avgRating =
            reviews.length > 0 ? totalRating / reviews.length : 0;

          return { ...product, avgRating };
        })
      );

      categoryCollection
        .find({ deleted: false })
        .lean()
        .then((categories) => {
          res.render("user/categoryPage", {
            category: categoryCollection.name,
            cateId: req.params.id,
            products: productsWithAverageRating,
            mainImages,
            user,
            categories,
            currentPage: page,
            totalPages: totalPages,
            itemsPerPage: PAGE_SIZE,
            cartCount: res.locals.cart_Count,
          });
        });
    } catch (error) {
      console.log("Error fetching products:", error);
      res.render("user/categoryPage", { error: "Error fetching products" });
    }
  },
  viewProductErrormsg: async (req, res) => {
    const user = req.session.user;
    if (!user) {
      return res.redirect("/login");
    }
    const productId = req.query.id;

    try {
      // Fetch the product from the database based on the product ID
      const product = await productCollection
        .findById(productId)
        .lean()
        .populate("category")
        .lean();
      if (!product) {
        // If the product is not found, handle the error and render an appropriate error page
        return res.render("user/error", { messageErr: "Product not found" });
      }

      const [firstImage] = product.images;

      // Render the product details page and pass the product data to the template
      res.render("user/productDetails", {
        product,
        user,
        firstImage,
        messageErr: "Product is not available Now",
      });
    } catch (error) {
      console.error("Error fetching product details:", error);
      // Handle the error and render an appropriate error page
      res.render("user/error", {
        messageErr: "Error fetching product details",
      });
    }
  },
  viewallproducts: async (req, res) => {
    const user = req.session.user;
    let mainImages = [];
    if (!user) {
      return res.redirect("/login");
    }

    productCollection
      .find()
      .lean()
      .populate("category")
      .lean()
      .then((products) => {
        products.map((product) => {
          // Set the first image as the main image if there are images, otherwise set it to an empty string
          return (mainImages = [
            ...mainImages,
            product.images.length > 0 ? product.images[0] : "",
          ]);
        });

        category
          .find({ deleted: false })
          .lean()
          .then((categories) => {
            res.render("user/allproducts", {
              products,
              user,
              categories,
              mainImages,
              cartCount: res.locals.cart_Count,
            });
          });
      })
      .catch((error) => {
        console.log("Error fetching products:", error);
        res.render("user/Userdashboard", { error: "Error fetching products" });
      });
  },

  gridView: async (req, res) => {
    const user = req.session.user;
    console.log("dashbord");
    let mainImages = [];
    if (!user) {
      return res.redirect("/login");
    }
    try {
      // Retrieve all offer messages from the database
      const allOffers = await offerCollection.find().lean();
      // Randomly select one offer message to display
      const randomIndex = Math.floor(Math.random() * allOffers.length);
      const randomOffer = allOffers[randomIndex];
      const PAGE_SIZE = 10; // Number of items per page

      const page = parseInt(req.query.page, 10) || 1;
      const totalProducts = await productCollection.countDocuments();
      const totalPages = Math.ceil(totalProducts / PAGE_SIZE);
      const skip = (page - 1) * PAGE_SIZE;

      const products = await productCollection
        .find({ deleted: false })
        .lean()
        .populate("category")
        .lean()
        .sort({ name: 1 })
        .skip(skip)
        .limit(PAGE_SIZE)
        .lean();
      products.map((product) => {
        // Set the first image as the main image if there are images, otherwise set it to an empty string
        return (mainImages = [
          ...mainImages,
          product.images.length > 0 ? product.images[0] : "",
        ]);
      });
      const categories = await categoryCollection
        .find({ deleted: false })
        .lean();
      res.render("user/gridView", {
        products,
        user,
        categories,
        mainImages,
        currentPage: page,
        totalPages: totalPages,
        itemsPerPage: PAGE_SIZE,
        randomOffer,
      });
    } catch (error) {
      console.log(error);
    }
  },
  demoView: async (req, res) => {
    const user = req.session.user;

    let mainImages = [];
    if (!user) {
      return res.redirect("/login");
    }
    try {
      // Retrieve all offer messages from the database
      const allOffers = await offerCollection.find().lean();
      // Randomly select one offer message to display
      const randomIndex = Math.floor(Math.random() * allOffers.length);
      const randomOffer = allOffers[randomIndex];
      const PAGE_SIZE = 10; // Number of items per page

      const page = parseInt(req.query.page, 10) || 1;
      const totalProducts = await productCollection.countDocuments();
      const totalPages = Math.ceil(totalProducts / PAGE_SIZE);
      const skip = (page - 1) * PAGE_SIZE;

      const products = await productCollection
        .find({ deleted: false })
        .lean()
        .populate("category")
        .lean()
        .sort({ name: 1 })
        .skip(skip)
        .limit(PAGE_SIZE)
        .lean();
      products.map((product) => {
        // Set the first image as the main image if there are images, otherwise set it to an empty string
        return (mainImages = [
          ...mainImages,
          product.images.length > 0 ? product.images[0] : "",
        ]);
      });
      const categories = await categoryCollection
        .find({ deleted: false })
        .lean();
      res.render("user/demo", {
        products,
        user,
        categories,
        mainImages,
        currentPage: page,
        totalPages: totalPages,
        itemsPerPage: PAGE_SIZE,
        randomOffer,
      });
    } catch (error) {
      console.log(error);
    }
  },
  sorting: async (req, res) => {
    const user = req.session.user;
    let mainImages = [];
    if (!user) {
      return res.redirect("/login");
    }
    try {
      // Retrieve all offer messages from the database
      const allOffers = await offerCollection.find().lean();
      // Randomly select one offer message to display
      const randomIndex = Math.floor(Math.random() * allOffers.length);
      const randomOffer = allOffers[randomIndex];
      const PAGE_SIZE = 10; // Number of items per page

      const page = parseInt(req.query.page, 10) || 1;
      const totalProducts = await productCollection.countDocuments();
      const totalPages = Math.ceil(totalProducts / PAGE_SIZE);
      const skip = (page - 1) * PAGE_SIZE;

      const products = await productCollection
        .find({ deleted: false })
        .lean()
        .populate("category")
        .lean()
        .sort({ name: 1 })
        .skip(skip)
        .limit(PAGE_SIZE)
        .lean();
      products.map((product) => {
        // Set the first image as the main image if there are images, otherwise set it to an empty string
        return (mainImages = [
          ...mainImages,
          product.images.length > 0 ? product.images[0] : "",
        ]);
      });
      const categories = await categoryCollection
        .find({ deleted: false })
        .lean();
      res.json({ products, categories });
    } catch (error) {
      console.log(error.message);
    }
  },
  getWallet: async (req, res) => {
    const user = req.session.user;
    const userId = req.session.user._id;
    const userName = req.session.user.username;
    const userInfo = await UserCollection.findById(userId);
    const myWalletAmount = userInfo.wallet;
    res.render("user/wallet", {
      userName,
      myWalletAmount,
      user,
      cartCount: res.locals.cart_Count,
    });
  },
  writeReview: async (req, res) => {
    try {
      const { id } = req.params;
      const { reviewText } = req.body;
      const { rating } = req.body;
      const reviewImage = req.file;

      const newReview = new reviewCollection({
        product: id,
        user: req.session.user._id,
        text: reviewText,
        rating: parseInt(rating),
        image: reviewImage.filename,
      });

      await newReview.save();

      // Calculate average rating for the product
      const reviews = await reviewCollection.find({ product: id }).lean();
      const totalRating = reviews.reduce(
        (sum, review) => sum + review.rating,
        0
      );
      const averageRating = totalRating / reviews.length;
      // Update average rating in the Review model
      await reviewCollection.updateOne(
        { product: id },
        { avgRating: averageRating }
      );
      res.redirect(`/product/${id}`); // Redirect back to the product detail page
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "An error occurred while submitting the review." });
    }
  },
  filter: async (req, res) => {
    const selectedStock = req.query.stock; // Get the selected stock value from the query parameter

    try {
      let query = {};
      if (selectedStock !== "all") {
        query.stock = selectedStock;
      }
      const filteredProducts = await productCollection.find(query).lean();
      console.log("filteredProducts", filteredProducts);
      res.json(filteredProducts);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "An error occurred" });
    }
  },
  checkReferalCode: async (req, res) => {
    const referralCode = req.query.referralCode;
    try {
      const validReferrer = await UserCollection.findOne({ referralCode });

      if (validReferrer) {
        // Credit the referring user's wallet with the reward amount
        const rewardAmount = 500; // You can adjust this amount as needed
        validReferrer.walletBalance += rewardAmount;
        await validReferrer.save();

        res.json({ valid: true });
      } else {
        res.json({ valid: false });
      }
    } catch (error) {
      console.error("Error checking referral code:", error);
      res
        .status(500)
        .json({ error: "An error occurred while checking referral code." });
    }
  },
};

// Generate OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
function generateReferralCode(name, email) {
  // Combine name and email into a single string
  const data = name.toLowerCase() + email.toLowerCase();

  // Hash the combined string using SHA-256
  const hash = crypto.createHash("sha256").update(data).digest("hex");

  // Take the first 8 characters of the hash as the referral code
  const referralCode = hash.substr(0, 8);

  return referralCode;
}
