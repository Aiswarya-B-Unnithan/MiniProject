// Import necessary modules
const orderCollection = require("../../models/orderModel");
const productCollection = require("../../models/productModel");
const categoryCollection = require("../../models/categoryModel");
const userCollection = require("../../models/userModel");
const getTopSellingProducts = require("../../Helpers/salesReportHelperFunctions/getPopularProducts");
const getRevenueByCategory = require("../../Helpers/salesReportHelperFunctions/getRevenueByCategory");
const getRevenueByDate = require("../../Helpers/salesReportHelperFunctions/getRevenueByDate");
const getCustomerInformation = require("../../Helpers/salesReportHelperFunctions/getCustomerInformation");
const getDiscountsAndCoupons = require("../../Helpers/salesReportHelperFunctions/getDiscountsAndCoupons");
const moment = require("moment");
const PDFDocument = require("pdfkit");
const fs = require("fs");

async function getCategoryNameById(categoryId) {
  try {
    const category = await categoryCollection.findById(categoryId);
    return category ? category.name : "Unknown Category";
  } catch (error) {
    console.log("Error fetching category:", error);
    return "Unknown Category";
  }
}
async function getProductById(productId) {
  try {
    const product = await productCollection.findById(productId);
    console.log("productfromgetProductByIdfn", product);
    return product;
  } catch (error) {
    console.log("Error fetching product by ID:", error);
    throw error;
  }
}
module.exports = {
  getSalesReportData: async (req, res) => {
    try {
      const orders = await orderCollection.find();
      let productQuantities = {};

      // Calculate product quantities
      orders.forEach((order) => {
        order.cartItems.forEach((item) => {
          const productId = item.product;
          const quantity = item.quantity;

          if (productQuantities[productId]) {
            productQuantities[productId] += quantity;
          } else {
            productQuantities[productId] = quantity;
          }
        });
      });

      // Get top selling product IDs
      const topSellingProductIds = Object.keys(productQuantities)
        .sort(
          (productIdA, productIdB) =>
            productQuantities[productIdB] - productQuantities[productIdA]
        )
        .slice(0, 3);

      // Fetch top selling product details
      const topSellingProductsDetails = await productCollection.find({
        _id: { $in: topSellingProductIds },
      });

      // Extract product names and quantities for Chart.js
      const topSellingProductNames = topSellingProductsDetails.map(
        (product) => product.productName
      );
      const topSellingProductQuantities = topSellingProductIds.map(
        (productId) => productQuantities[productId]
      );

      res.json({
        productNames: topSellingProductNames,
        productQuantities: topSellingProductQuantities,
      });
    } catch (error) {
      res.status(500).json({ error: "Error fetching sales report data" });
    }
  },
  getSalesReportForLineGraph: async (req, res) => {
    try {
      const orders = await orderCollection.find();
      const products = await productCollection.find();
      const categories = await categoryCollection.find();

      const productCategories = {};

      products.forEach((product) => {
        productCategories[product._id.toString()] = {
          categoryId: product.category.toString(),
          productName: product.productName,
        };
      });

      const categoryNames = {};
      categories.forEach((category) => {
        categoryNames[category._id.toString()] = category.name;
      });

      const data = {
        orders: orders,
        productCategories: productCategories,
        categoryNames: categoryNames,
      };

      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "An error occurred while fetching data" });
    }
  },

  getSalesReport: async (req, res) => {
    try {
      // Calculate total revenue
      const orders = await orderCollection.find();
      const totalRevenue = orders.reduce(
        (acc, order) => acc + order.totalPrice,
        0
      );

      // Calculate total units sold
      const totalUnitsSold = orders.reduce((acc, order) => {
        return (
          acc +
          order.cartItems.reduce((cartAcc, item) => cartAcc + item.quantity, 0)
        );
      }, 0);

      // Fetch top selling products
      const topSellingProducts = await getTopSellingProducts();

      // Calculate revenue by product category
      const revenueByCategory = await getRevenueByCategory();

      // Fetch customer information
      const customerInformation = await getCustomerInformation();

      // Fetch discounts and coupons data
      const discountsAndCoupons = await getDiscountsAndCoupons();

      // Create a new PDF document
      const doc = new PDFDocument();
      const pdfFilePath = "sales_report.pdf";

      // Set response headers for PDF download
      res.setHeader(
        "Content-disposition",
        `attachment; filename=${pdfFilePath}`
      );
      res.setHeader("Content-type", "application/pdf");

      // Pipe the PDF content directly to the response
      doc.pipe(res);

      // Set font sizes and line spacing
      doc.fontSize(12);
      doc.lineGap(8);

      // Add content to the PDF document
      doc
        .font("Helvetica-Bold")
        .fontSize(20)
        .text("SALES REPORT ESHOP", {
          align: "center",
          underline: true,
          margin: { top: 20 },
        })
        .moveDown(); // Add space

      doc
        .fontSize(14)
        .text("Total Revenue: ", { continued: true })
        .text(`Rs. ${totalRevenue}`, { bold: true, continued: true }) // Use "continued" to keep text on the same line
        .text(" Total Units Sold: ", { continued: true })
        .text(`${totalUnitsSold}`, { bold: true })
        .moveDown(2); // Add space

      // Add top selling products to the PDF
      doc
        .font("Helvetica-Bold")
        .fontSize(16)
        .text("Top Selling Products", { underline: true, margin: { top: 20 } })
        .moveDown(); // Add space

      topSellingProducts.forEach((product, index) => {
        doc
          .font("Helvetica-Bold")
          .fontSize(12)
          .text(`${index + 1}. ${product.name}:`, { continued: true })
          .font("Helvetica")
          .text(`Rs. ${product.totalRevenue}`)
          .moveDown(); // Add space after each product
      });

      // Add revenue by category to the PDF
      doc
        .font("Helvetica-Bold")
        .fontSize(16)
        .text("Revenue by Category", { underline: true, margin: { top: 20 } })
        .moveDown(); // Add space

      Object.keys(revenueByCategory).forEach((category) => {
        doc
          .font("Helvetica-Bold")
          .fontSize(12)
          .text(`${category}:`, { continued: true })
          .font("Helvetica")
          .text(`Rs. ${revenueByCategory[category]}`)
          .moveDown(); // Add space after each category
      });

      // Add customer information to the PDF
      doc
        .font("Helvetica-Bold")
        .fontSize(16)
        .text("Customer Information", { underline: true, margin: { top: 20 } })
        .moveDown(); // Add space

      Object.keys(customerInformation).forEach((customerId) => {
        const customer = customerInformation[customerId];
        doc
          .font("Helvetica-Bold")
          .fontSize(12)
          .text(`Customer Name: ${customer.name}`)
          .text(`Customer Email: ${customer.email}`)
          .moveDown(); // Add space

        customer.orders.forEach((order) => {
          doc
            .font("Helvetica-Bold")
            .fontSize(12)
            .text(`Order ID: ${order.orderId}`)
            .text(`Order Date: ${order.orderDate}`)
            .text(`Total Price: Rs. ${order.totalPrice}`)
            .moveDown(); // Add space
        });
        doc.moveDown(); // Add space after each customer
      });

      // Add discounts and coupons to the PDF in a table-like format
      doc
        .font("Helvetica-Bold")
        .fontSize(16)
        .text("Discounts and Coupons", { underline: true, margin: { top: 20 } })
        .moveDown(); // Add space

      const tableHeaders = [
        "Coupon Code",
        "Usage Count",
        "Total Amount Saved (Rs.)",
      ];
      const tableData = [];

      Object.keys(discountsAndCoupons).forEach((couponCode) => {
        const coupon = discountsAndCoupons[couponCode];
        tableData.push([
          couponCode,
          coupon.usageCount.toString(),
          coupon.totalAmountSaved.toString(),
        ]);
      });

      // Calculate column widths
      const columnWidths = [doc.widthOfString(tableHeaders[0])];
      tableHeaders.slice(1).forEach((header, index) => {
        const dataWidth = Math.max(
          ...tableData.map((row) => doc.widthOfString(row[index]))
        );
        columnWidths.push(Math.max(doc.widthOfString(header), dataWidth));
      });

      // Define table position and row height
      const tableX = 50; // X-coordinate
      const tableY = doc.y + 15; // Y-coordinate
      const rowHeight = 20;

      // Draw table headers
      doc.moveDown().font("Helvetica-Bold").fontSize(12);

      tableHeaders.forEach((header, index) => {
        doc.text(
          header,
          tableX + sumArray(columnWidths.slice(0, index)),
          tableY
        );
      });

      // Draw table data
      doc.font("Helvetica").fontSize(12);
      tableData.forEach((row, rowIndex) => {
        row.forEach((cell, cellIndex) => {
          doc.text(
            cell,
            tableX + sumArray(columnWidths.slice(0, cellIndex)),
            tableY + rowHeight * (rowIndex + 1)
          );
        });
      });

      // Draw table borders
      doc.lineWidth(0.5);
      const tableWidth = sumArray(columnWidths);
      const tableHeight = rowHeight * (tableData.length + 1);

      doc.rect(tableX, tableY, tableWidth, tableHeight).stroke();

      // Move down after the table
      doc.moveDown();

      // Function to calculate the sum of an array
      function sumArray(arr) {
        return arr.reduce((acc, val) => acc + val, 0);
      }

      // Finalize the PDF
      doc.end();
    } catch (error) {
      console.error("Error generating sales report:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  getSalesReportForDay: async (req, res) => {
    try {
      const date = req.params.date;
      // Convert the date to a JavaScript Date object
      const day = new Date(date);

      // Calculate the start and end of the day
      const dayStart = new Date(day);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(day);
      dayEnd.setHours(23, 59, 59, 999);

      // Query your database to fetch sales data for the specified day
      const orders = await orderCollection.find({
        orderDate: {
          $gte: dayStart,
          $lte: dayEnd,
        },
      });

      // Calculate total revenue for the day
      const totalRevenue = orders.reduce(
        (total, order) => total + order.finalPrice,
        0
      );

      // Group orders by category and calculate category-wise revenue (if applicable)
      const revenueByCategory = {};

      for (const order of orders) {
        for (const item of order.cartItems) {
          const productId = item.product;
          const quantity = item.quantity;
          const product = await getProductById(productId);

          if (product) {
            const categoryId = product.category;
            const categoryName = await getCategoryNameById(categoryId); // Get category name
            if (product.offerPrice) {
              productRevenue = quantity * product.offerPrice;
            } else {
              productRevenue = quantity * product.price;
            }

            if (revenueByCategory[categoryName]) {
              revenueByCategory[categoryName] += productRevenue;
            } else {
              revenueByCategory[categoryName] = productRevenue;
            }
          }
        }
      }

      console.log("Category Revenue:", revenueByCategory);

      res.status(200).json({
        date: date,
        totalRevenue: totalRevenue,
        orders: orders,
        categoryRevenue: revenueByCategory,
      });
    } catch (error) {
      console.error(error);
      // Handle errors and send an appropriate response
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  getSalesReportForWeek: async (req, res) => {
    try {
      const { weekStart, weekEnd } = req.params;
      const startDate = moment(weekStart, "YYYY-MM-DD").toDate();
      const endDate = moment(weekEnd, "YYYY-MM-DD").toDate();

      const orders = await orderCollection.find({
        orderDate: {
          $gte: startDate,
          $lte: endDate,
        },
      });

      // Calculate total revenue for the day
      const totalRevenue = orders.reduce(
        (total, order) => total + order.finalPrice,
        0
      );
      // Group orders by category and calculate category-wise revenue (if applicable)
      const revenueByCategory = {};

      for (const order of orders) {
        for (const item of order.cartItems) {
          const productId = item.product;
          const quantity = item.quantity;
          const product = await getProductById(productId);

          if (product) {
            const categoryId = product.category;
            const categoryName = await getCategoryNameById(categoryId); // Get category name

            if (product.offerPrice) {
              productRevenue = quantity * product.offerPrice;
            } else {
              productRevenue = quantity * product.price;
            }

            if (revenueByCategory[categoryName]) {
              revenueByCategory[categoryName] += productRevenue;
            } else {
              revenueByCategory[categoryName] = productRevenue;
            }
          }
        }
      }

      // Create a response object
      res.status(200).json({
        startDate: startDate,
        endDate: endDate,
        totalRevenue: totalRevenue,
        orders: orders,
        categoryRevenue: revenueByCategory,
      });
    } catch (error) {}
  },
  getSalesReportForMonth: async (req, res) => {
    let productRevenue = 0;
    try {
      // Extract the year and month parameters from the URL
      const { year, month } = req.params;

      // Create a date range for the entire month based on the provided year and month
      const startOfMonth = moment(`${year}-${month}-01`, "YYYY-MM-DD").startOf(
        "month"
      );
      console.log("startOfMonth", startOfMonth);
      const endOfMonth = moment(startOfMonth).endOf("month");
      console.log("endOfMonth", endOfMonth);

      const orders = await orderCollection.find({
        orderDate: {
          $gte: startOfMonth.toDate(), // Greater than or equal to the start of the month
          $lte: endOfMonth.toDate(), // Less than or equal to the end of the month
        },
      });
      // Calculate total revenue for the day
      const totalRevenue = orders.reduce(
        (total, order) => total + order.finalPrice,
        0
      );
      // Group orders by category and calculate category-wise revenue (if applicable)
      const revenueByCategory = {};

      for (const order of orders) {
        for (const item of order.cartItems) {
          const productId = item.product;
          const quantity = item.quantity;
          const product = await getProductById(productId);

          if (product) {
            const categoryId = product.category;
            const categoryName = await getCategoryNameById(categoryId); // Get category name

            if (product.offerPrice) {
              productRevenue = quantity * product.offerPrice;
            } else {
              productRevenue = quantity * product.price;
            }

            if (revenueByCategory[categoryName]) {
              revenueByCategory[categoryName] += productRevenue;
            } else {
              revenueByCategory[categoryName] = productRevenue;
            }
          }
        }
      }

      // Create a response object
      res.status(200).json({
        month: month,
        year: year,
        totalRevenue: totalRevenue,
        orders: orders,
        categoryRevenue: revenueByCategory,
      });
    } catch (error) {
      console.error("Error fetching sales report:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
  getSalesReportForYear: async (req, res) => {},
};

async function fetchWeeklySalesData(startDate, endDate) {
  const orders = await orderCollection.find({
    orderDate: {
      $gte: startDate,
      $lte: endDate,
    },
  });

  return weeklySalesData;
}
