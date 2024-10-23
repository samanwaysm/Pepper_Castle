const express = require("express");
const session = require("express-session");

const cartDb = require("../model/cartSchema")


async function isCart(req, res, next) {
    const userId = req.session.userId;
  
    if (userId) {
      console.log(userId);
      const cart = await cartDb.findOne({ userId: userId });
      console.log(cart);
      if (cart.cartItems.length < 1) {
        console.log("block");
        res.redirect("/cart");
      }
      else {
        next();
      }
    }
  }

  function isOrderSuccess(req, res, next) {
    if (req.session.ordersuccess === true) {
      return next();
    }
    res.redirect("/orderSuccess");
  }

module.exports = {
    isCart,
    isOrderSuccess
};