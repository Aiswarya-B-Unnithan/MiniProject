const user = require("../models/userModel");
const orders = require("../models/orderModel");
const Stripe = require("stripe");
const axios = require("axios");

const publishableKey =
  "pk_test_51NelB1IcIHe4CKYvlry0vgIjnRjbLi0KLB82SXxZXxCQXkyT1ox3GsUxfEzEBi340bJMs8tuf16zhrF7V5Fbi9M200iyzeum3q";
const Secretkey =
  "sk_test_51NelB1IcIHe4CKYvQN3SyOTwKjQkRepadisP9eHAdqoyGCP2ad6cZAyD7vo3B1A7uwHmFQNtVeOUCgLTyI7Qv29c00TXPENc4X";
const stripe = Stripe(Secretkey);
let discountedTotal = 0;
let paymentMethod = "";
let couponDiscountAmount = 0;
let cartTotal = 0;

module.exports = {
  //get stripe payment gateway
  getpayment: async (req, res) => {
    discountedTotal = req.query.cartTotal;
    paymentMethod = req.query.paymentMethod;
    couponDiscountAmount = req.query.CouponDiscountAmount;
    cartTotal = req.query.cartTotal;
  
    const user = req.session.user;
    userOrders = await orders.findOne();
    res.render("user/stripePayment", {
      discountedTotal,
      user,
      cartTotal,
      couponDiscountAmount,
      paymentMethod,
      cartCount: res.locals.cart_Count,
    });
  },
  submitPayment: async (req, res) => {
  
    paymentMethod = req.body.paymentMethod;
    cartTotal = req.body.cartTotal;
    discountedTotal = req.body.discountedTotal;
    CouponDiscountAmount = req.body.CouponDiscountAmount;

    try {
      const customer = await stripe.customers.create({
        email: req.body.stripeEmail,
        source: req.body.stripeToken,
      });
     
      const discountedTotalPaise = Math.round(discountedTotal * 100);

      const charge = await stripe.charges.create({
        amount: discountedTotalPaise,
        description: "Eshop Online Purchase",
        currency: "INR",
        customer: customer.id,
      });

      res.redirect(
        `/order/submitOrder?discountedTotal=${cartTotal}&paymentMethod=${paymentMethod}&CouponDiscountAmount=${CouponDiscountAmount}`
      );
    } catch (error) {
      console.error(error);
    }
  },
};
