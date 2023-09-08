const orderCollection = require("../models/orderModel");
const cartCollection = require("../models/cartModel");
const addressCollection = require("../models/addressModel");
const categoryCollection = require("../models/categoryModel");

const generateInvoiceHtml = require("../Bootstrap/custonJsFiles/generateInvoiceHtml");
const puppeteer = require("puppeteer");
const {
  updateStockMiddleware,
} = require("../Middleware/updateStockMiddleware");
const User = require("../models/userModel");

let discountedTotal = 0;
let paymentMethod = "";
let CouponDiscountAmount = 0;
module.exports = {
  OrdersManagementFn: async (req, res) => {
    console.log("OrdersManagementFn");
    userId = req.session.user._id;
    const user = req.session.user;
    const selectedAddressId = req.session.selectedAddressId;
    // console.log("selectedAddressId", selectedAddressId);
    discountedTotal = req.params.discountedTotal;
    paymentMethod = req.body.paymentMethod;
    CouponDiscountAmount = req.body.CouponDiscountAmount;
    console.log("paymentMethod", paymentMethod);
    console.log("CouponDiscountAmount", CouponDiscountAmount);
    // console.log("discountedTotal", discountedTotal);

    try {
      // Find the user's cart
      const cart = await cartCollection
        .findOne({ user: userId })
        .populate("items.product")
        .lean();

      if (cart) {
        const totalPrice = cart.items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        );

        // const deliveringAddressId = req.session.deleveryAddressId;
        const deliveringAddress = await addressCollection
          .findById(selectedAddressId)
          .lean();
        console.log(req.session.user.couponCode);
        // Fetch the coupon details if applied, or set default values
        const couponCode = req.session.user.selectedCoupon || "No Coupon Used";
        // const couponAmount = req.session.user.discountedAmount || 0;
        const customOrderID = await generateUniqueID();
        // Create a new order document based on the cart data
        const newOrder = new orderCollection({
          user: userId,
          customOrderID: customOrderID,
          cartItems: cart.items,
          totalPrice,
          discountedTotal,
          paymentMethod,
          couponCode,
          discountsOnMRP: req.session.discountOnMRP,
          finalPrice: discountedTotal,
          couponAmount: CouponDiscountAmount,
          deliveringAddress: deliveringAddress,
          status: "pending",
        });

        // Save the new order to the Order collection
        await newOrder.save();

        const categories = await categoryCollection
          .find({ deleted: false })
          .lean();

        const userOrders = await orderCollection
          .find({ user: userId })
          .populate("cartItems.product")
          .lean();
        // Delete the cart items from the cart collection
        await cartCollection.findOneAndDelete({ user: userId });
        // Redirect to the order confirmation page
        res.render("user/orderSuccessPage", {
          userOrders,
          user,
          categories,
          cartCount: res.locals.cart_Count,
        });
      }
    } catch (error) {
      console.log(error);
    }
  },
  viewOrders: async (req, res) => {
    const user = req.session.user;
    try {
      // const userOrders = await orderCollection.find().lean();
      const userId = req.session.user._id;
      const PAGE_SIZE = 10; // Number of items per page
      const page = parseInt(req.query.page, 10) || 1;

      const totalProducts = await orderCollection.countDocuments();
      const totalPages = Math.ceil(totalProducts / PAGE_SIZE);
      const skip = (page - 1) * PAGE_SIZE;
      const userOrders = await orderCollection
        .find({ user: userId })
        .sort({ orderDate: -1 })
        .skip(skip)
        .limit(PAGE_SIZE)
        .lean()
        .populate("cartItems.product")
        .lean();

      if (userOrders && userOrders.length > 0) {
        // Format the orderDate for each order
        const formattedUserOrders = userOrders.map((order) => {
          order.formattedOrderDate = order.orderDate.toLocaleDateString(
            "en-US",
            {
              day: "numeric",
              month: "short",
            }
          );
          // Access product name within each cartItem
          order.cartItems.forEach((cartItem) => {
            cartItem.productName = cartItem.product.productName;
          });
          return order;
        });

        const categories = await categoryCollection
          .find({ deleted: false })
          .lean();
        res.render("user/conformedOrders", {
          userOrders: formattedUserOrders,
          user,
          categories,
          currentPage: page,
          totalPages: totalPages,
          itemsPerPage: PAGE_SIZE,
        });
      } else {
        res.render("user/noConfirmedOrderPage", user);
      }
    } catch (error) {
      console.log(error);
    }
  },
  filterOrder: async (req, res) => {
    const selectedStatus = req.query.status;
    const userId = req.session.user._id;
    let filteredOrders;

    if (selectedStatus === "all") {
      // Retrieve all orders
      filteredOrders = await orderCollection
        .find({ user: userId })
        .sort({ name: 1 })
        .lean()
        .populate("cartItems.product")
        .lean();
    } else {
      // Retrieve orders based on selected status
      filteredOrders = await orderCollection
        .find({ user: userId, status: selectedStatus })
        .sort({ name: 1 })
        .lean()
        .populate("cartItems.product")
        .lean();
    }
    // Format the orderDate for each order
    const formattedUserOrders = userOrders.map((order) => {
      order.formattedOrderDate = order.orderDate.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
      });
      // Access product name within each cartItem
      order.cartItems.forEach((cartItem) => {
        cartItem.productName = cartItem.product.productName;
      });
      return order;
    });

    const categories = await categoryCollection.find({ deleted: false }).lean();
    res.render("user/conformedOrders", {
      userOrders: formattedUserOrders,
      user,
      categories,
      statusColorClass: getStatusColorClass,
      currentPage: page,
      totalPages: totalPages,
      itemsPerPage: PAGE_SIZE,
    });
  },
  DetailedViewOfOrder: async (req, res) => {
    const user = req.session.user;
    const orderId = req.params.id;
    console.log("orderId", orderId);
    try {
      const order = await orderCollection
        .findById(orderId)
        .lean()
        .populate("cartItems.product");

      const currentParsedDate = new Date(); // Parsed current date
      const deliveryParsedDate = new Date(order.deliveryDate);

      const categories = await categoryCollection
        .find({ deleted: false })
        .lean();
      returnValue = order.status === "returned" || order.status === "cancelled";

      res.render("user/detailedOrderDetails", {
        order,
        returnValue,
        categories,
        user,
        deliveryParsedDate,
        currentParsedDate,
      });
    } catch (error) {
      res.render("user/detailedOrderDetails", {
        message: "Something Went Wrong!!Try Again",
      });
    }
  },

  // orderReturn function
  orderReturn: async (req, res) => {
    const { orderId } = req.body;
    const user = req.session.user;
    try {
      // Find the order and update the status
      const updatedOrder = await orderCollection
        .findOneAndUpdate(
          { _id: orderId, status: "delivered" }, // Filter to ensure status is "delivered"
          { status: "returning" }, // Update the status to "returning"
          { new: true } // Return the updated order document
        )
        .lean();
      const currentParsedDate = Date.parse(new Date()); // Current date
      const deliveryParsedDate = Date.parse(updatedOrder.deliveryDate);
      console.log("updatedOrder", deliveryParsedDate);
      console.log("currentParsedDate", currentParsedDate);

      if (!updatedOrder) {
        return res.render("user/detailedOrderDetails", {
          message: "Order Not Found or Status is not 'delivered'",
        });
      }

      return res.render("user/detailedOrderDetails", {
        message: "Amount Returned Successfully To Your Wallet",
        order: updatedOrder,
        user,
      });
    } catch (error) {
      console.log(error);
      return res.render("user/detailedOrderDetails", {
        message: "Something went wrong. Please try again.",
      });
    }
  },
  cancelOrder: async (req, res) => {
    const flag = true;
    const user = req.session.user;
    const { orderId } = req.body;
    try {
      // Find the order by ID
      const order = await orderCollection.findById(orderId);

      if (!order) {
        // Order not found
        return res.render("user/detailedOrderDetails", {
          message: "Order not found",
          flag,
        });
      }

      if (order.status === "Delivered") {
        // Order status is not "pending," cannot cancel
        return res.render("user/detailedOrderDetails", {
          message: 'Cannot cancel the order as it is not in "delivered" status',
          flag,
        });
      } else {
        const CancelOrder = await orderCollection
          .findOneAndUpdate(
            { _id: orderId }, // Filter to ensure status is "delivered"
            { status: "cancelled", userOrderCancelDate: new Date() }, // Update the status to "returning"
            { new: true } // Return the updated order document
          )
          .lean();

        return res.redirect("/order/allOrders");
      }
    } catch (error) {
      console.log(error);
      return res.render("user/detailedOrderDetails", {
        message: "Something went wrong while cancelling the order",
      });
    }
  },
  viewOrderSuccessPage: async (req, res) => {
    res.render("user/orderSuccessPage");
  },
  submitOrder: async (req, res) => {
    const user = req.session.user;
    const discountedTotal = req.query.discountedTotal;
    const paymentMethod = req.query.paymentMethod;
    const CouponDiscountAmount = req.query.CouponDiscountAmount;
    res.render("user/submitOrderForm", {
      discountedTotal,
      user,
      paymentMethod,
      CouponDiscountAmount,
    });
  },
  postSubmitOrder: async (req, res) => {
    const discountedTotal = req.query.discountedTotal;
    const paymentMethod = req.query.paymentMethod;
    const discountedAmount = req.query.discountedAmount;
    res.render("user/submitOrderForm", {
      discountedTotal,
      paymentMethod,
      discountedAmount,
    });
  },
  redirectingPaymentRoutes: async (req, res) => {
    const paymentMethod = req.query.paymentMethod;
    console.log("paymentMethod", paymentMethod);
  },

  viewInvoice: async (req, res) => {
    const orderId = req.params.orderId;
    try {
      const order = await orderCollection
        .findById(orderId)
        .populate("user")
        .populate("cartItems.product")
        .lean();

      const customOrderID = order.customOrderID;
      const invoiceHtml = generateInvoiceHtml(order, orderId);
      console.log("invoiceHtml", invoiceHtml);

      // Launch a headless browser with the new headless mode
      const browser = await puppeteer.launch({ headless: "new" });
      const page = await browser.newPage();
      // Set the content of the page
      await page.setContent(invoiceHtml);

      // Generate the PDF
      const pdfBuffer = await page.pdf({ format: "Letter" });

      // Close the browser
      await browser.close();

      // Set response headers for PDF download
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=invoice_${customOrderID}.pdf`
      );

      res.status(200).send(pdfBuffer);
    } catch (err) {
      console.error("Error:", err);
      res.status(500).send("An error occurred", err);
    }
  },
};

//creating unique orderid
async function generateUniqueID() {
  const potentialID = Math.floor(10000 + Math.random() * 90000); // Generates a random 5-digit number

  const existingOrder = await orderCollection.findOne({
    customOrderID: potentialID,
  });
  if (existingOrder) {
    return generateUniqueID(); // Retry if ID is not unique
  }

  return potentialID;
}
