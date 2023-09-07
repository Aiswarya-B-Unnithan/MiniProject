const express = require("express");
const Router = express.Router();
const salesReportHelper = require("../Helpers/Admin_Helpers/salesReportHelper");

// Fetch orders from the database
Router.get("/Report", salesReportHelper.getSalesReportData);
Router.get("/Report/lineGraph", salesReportHelper.getSalesReportForLineGraph);
Router.get("/productSalesReport", salesReportHelper.getSalesReport);

// Route for getting sales report for a specific day
Router.get("/salesReport/day/:date", salesReportHelper.getSalesReportForDay);
// Route for getting sales report for a specific week
Router.get(
  "/salesReport/week/:weekStart/:weekEnd",
  salesReportHelper.getSalesReportForWeek
);

// Route for getting sales report for a specific month
Router.get(
  "/salesReport/month/:year/:month",
  salesReportHelper.getSalesReportForMonth
);
// Route for getting sales report for a specific year
Router.get("/salesReport/year/:year", salesReportHelper.getSalesReportForYear);
module.exports = Router;
