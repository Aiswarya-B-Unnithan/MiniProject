const productCollection = require("../../models/productModel");
const orderCollection = require("../../models/orderModel");
const categoryCollection = require("../../models/categoryModel");
const adminCollection = require("../../models/adminModel");
const mongoose = require("mongoose");
const multer = require("multer");
const sharp = require("sharp");
const bodyParser = require("body-parser");
const User = require("../../models/userModel");

let totalEarnings = 0;
module.exports = {
  getLogin: async (req, res) => {
    const admin = req.session.admin;
    if (!admin) {
      return res.render("admin/admin-login");
    } else {
      return res.redirect("/dashboard");
    }
  },
  postLogin: async (req, res) => {
    const { username, password } = req.body;

    try {
      const adminData = await adminCollection.findOne({
        username: req.body.username,
        password: req.body.password,
      });
      // Validate admin credentials
      if (
        adminData.username === req.body.username &&
        adminData.password === req.body.password
      ) {
        req.session.admin = "admin";
        res.redirect("/admin/dashBoard");
      } else {
        res.render("admin/admin-login", {
          message: "Incorrect username or password",
        });
      }
    } catch {
      res.render("admin/admin-login", {
        message: "Incorrect username or password",
      });
    }

    // req.session.admin = "admin";
  },
  logout: async (req, res) => {
    req.session.destroy();
    res.redirect("/admin/login");
  },
  DashBorad: async (req, res) => {
    const admin = req.session.admin;
    const allOrders = await orderCollection
      .find()
      .sort({ orderDate: -1 })
      .populate("user", "username")
      .lean()
      .limit(5);

    const allUsers = await User.find()
      .sort({ registeredDate: -1 })
      .lean()
      .limit(5);
    const TotalCustomers = await User.find({ blocked: false }).count();
    // Fetch notifications
    const notifications = await orderCollection
      .find({ adminViewed: false })
      .count();
const categoryCount=await categoryCollection.find({deleted:false}).count()

    const orderCount = await orderCollection.find().count();
    //totalEarnings
    const totalEarningsResult = await orderCollection.aggregate([
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: "$totalPrice" },
        },
      },
    ]);

    if (totalEarningsResult.length > 0) {
      totalEarnings = totalEarningsResult[0].totalEarnings;
    } else {
    }

    res.render("admin/Dashboard", {
      admin,
      allOrders,
      allUsers,
      orderCount,
      totalEarnings,
      notifications,
      TotalCustomers,
      categoryCount,
    });
  },
  getProductsPage: async (req, res) => {
    const admin = req.session.admin;
    try {
      // Fetch all products from the database
      const products = await productCollection
        .find({ deleted: false })
        .lean()
        .populate("category");
      res.render("admin/productManagement", { products, admin });
    } catch (error) {
      res.render("admin/productManagement", {
        error: "Error fetching products",
      });
    }
  },
  GetAddProductPage: async (req, res) => {
    const admin = req.session.admin;

    categoryCollection
      .find()
      .lean()
      .then((categories) => {
        res.render("admin/addProduct", { categories, admin });
      })
      .catch((error) => {
        res.render("admin/addProduct", { error: "Error fetching categories" });
      });
  },
  AddProduct: async (req, res) => {
    const categoryId = new mongoose.Types.ObjectId(req.body.category);
    const imageUrls = [];
    try {
      const { name, price, description, stock, noOfStock } = req.body;
      const files = req.files;
      for (const file of files) {
        const imageBuffer = await sharp(file.buffer)
          .resize({
            width: 400,
            height: 500,
            fit: "cover",
          })
          .toBuffer();

        const imagePath = `uploads/${Date.now()}-${file.originalname}`;

        await sharp(imageBuffer).toFile(imagePath);

        imageUrls.push(imagePath);
      }
      const customID = await generateUniqueID();
      // Create a new product with the received data
      const newProduct = new productCollection({
        productName: name,
        customID: customID,
        stock: stock,
        ItemStock: noOfStock,
        price: price,
        description: description,
        category: categoryId, // Save the category _id as an ObjectId
        images: imageUrls,
      });

      // Save the new product to the database
      await newProduct.save();
      res.redirect("/admin/products");
    } catch (error) {
      console.error("Error adding product:", error);
      res.render("admin/addProduct", { messageErr: "Error adding product" });
    }
  },
  GetEditProductPage: async (req, res) => {
    const prodId = req.params.id;
    productCollection
      .findOne({ _id: prodId })
      .lean()
      .then((product) => {
        categoryCollection
          .find({ _id: product.category })
          .lean()
          .then((category) => {
            res.render("admin/editProduct", { product, category });
          });
      })
      .catch((error) => {
        res.render("admin/editProduct", { error: "Error fetching categories" });
      });
  },
  PostEditProductPage: async (req, res) => {
    const productId = req.params.id;
    const {
      name,
      price,
      description,
      category,
      stock,
      noOfStock,
      deleteImages,
    } = req.body;

    try {
      // Fetch the product from the database
      const product = await productCollection.findById(productId);
      const imageUrls = [];

      // Delete the selected images from the product images
      if (Array.isArray(deleteImages)) {
        for (const imageToDelete of deleteImages) {
          // Remove the image from the images array
          const index = product.images.indexOf(imageToDelete);
          if (index !== -1) {
            product.images.splice(index, 1);
          }

          // Delete the image file from the server (optional, if needed)
          // You can use fs.unlinkSync() to delete the file from the server
        }
      }

      // Combine existing images with new image URLs
      const existingImages = product.images;
      const files = req.files;
      for (const file of files) {
        const imageBuffer = await sharp(file.buffer)
          .resize({
            width: 400,
            height: 500,
            fit: "cover",
          })
          .toBuffer();

        const imagePath = `uploads/${Date.now()}-${file.originalname}`;

        await sharp(imageBuffer).toFile(imagePath);

        imageUrls.push(imagePath);
      }

      const combinedImages = existingImages.concat(imageUrls);

      // Update the product details in the database
      const updatedProduct = await productCollection.findByIdAndUpdate(
        productId,
        {
          productName: name,
          price,
          stock,
          ItemStock: noOfStock,
          description,
          category,
          images: combinedImages,
        },
        { new: true }
      );

      // Redirect the user to the product details page or product management page
      res.redirect("/admin/products");
    } catch (error) {
      // Handle the error and show an error message to the user
      res.render("admin/editProduct", { error: "Error updating product" });
    }
  },
  Serach: async (req, res) => {
    const admin = req.res.admin;
    try {
      const productName = req.query.name;

      // Create a query object to filter products based on the product name
      const query = { deleted: false };

      if (productName) {
        query.productName = { $regex: productName, $options: "i" };
      }

      // Fetch products from the database based on the query
      const products = await productCollection
        .find(query)
        .lean()
        .populate("category")
        .lean()
        .exec();

      res.render("admin/productManagement", { products, admin });
    } catch (error) {
      res.render("admin/productManagement", {
        error: "Error fetching products",
      });
    }
  },
  DeleteProduct: async (req, res) => {
    if (!req.session.admin) {
      return res.redirect("/admin/login");
    }
    const prodId = req.params.id;
    productCollection
      .findByIdAndUpdate(prodId, { deleted: true })
      .lean()
      .then(() => {
        res.redirect("/admin/products");
      })
      .catch((err) => {
        res.redirect("/admin/products");
      });
  },
};

async function generateUniqueID() {
  const potentialID = Math.floor(10000 + Math.random() * 90000); // Generates a random 5-digit number

  const existingProduct = await productCollection.findOne({
    customID: potentialID,
  });
  if (existingProduct) {
    return generateUniqueID(); // Retry if ID is not unique
  }

  return potentialID;
}
