const express = require("express");
const session = require("express-session");


function isAdminAuthenticated(req, res, next) {
    if (req.session.isAdminAuthenticated === true) {
      return next();
    }
    res.redirect("/adminlogin");
  }
  
  function isAdminNotAuthenticated(req, res, next) {
    if (req.session.isAdminAuthenticated === true) {
      return res.redirect("/dashboard");
    }
    next();
  }


  module.exports = {
    isAdminAuthenticated,
    isAdminNotAuthenticated,
  };
  