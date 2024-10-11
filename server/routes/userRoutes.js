const express = require('express');
const route = express.Router();
const session = require('express-session');
const axios = require('axios')
const store = require('../middleware/multer')

const {isUserAuthenticated,isUserNotAuthenticated} = require('../middleware/userAuth');

const services = require('../render/userServices');
const controller = require('../controller/userSide/userController');
const categoryAndItemContoller = require('../controller/userSide/categoryAndItemController');
const cartController = require('../controller/userSide/cartController');
const addressController = require('../controller/userSide/addressController');
const orderController = require('../controller/userSide/orderController');


route.get('/',services.homeRoutes)
route.get('/signin',services.signin)
route.get('/signup',services.signUp)
route.get('/forgot-password',services.forgotPassword)
route.get('/otp-verification',services.otpVerification)
route.get('/reset-password',services.resetPassword)
route.get('/about',services.about)
route.get('/contact',services.contact)
route.get('/our-menu',services.ourMenuList)
route.get('/cart',isUserAuthenticated,services.cart)
route.get('/checkout',isUserAuthenticated,services.checkout)
route.get('/orderSuccess',services.orderSuccess)

// APIs

route.post('/api/signup',controller.signUp)
route.post('/api/signin',controller.signIn)   // Login 
// route.post('/api/logout',controller.userLogout)   // Logout

route.post('/api/generateotp',controller.forgotOtp)
route.post('/api/otpverification',controller.forgototpverification)
route.post('/api/generateotp',controller.forgotOtp)
route.post('/api/updatepassword',controller.updatepassword)

route.post('/api/create-order',orderController.createOrder)
route.get('/api/success',orderController.handlePaymentSuccess)
// route.post('/create-checkout-session',orderController.redirectStrip)

// route.get('/api/',categoryAndItemContoller.homeCategoryShow)
route.get('/api/ourMenuList',categoryAndItemContoller.ourMenuList)


route.get('/api/itemCount',cartController.getCartItemCount)
route.get('/api/addToCart',cartController.addToCart)
route.get('/api/showCart',cartController.showCart)
route.post('/api/update-cart',cartController.updateCart)
route.delete('/api/remove-from-cart',cartController.removeCart)

route.post('/api/addAddress', addressController.addAddress);
route.get('/api/showDefaultAddress',addressController.showDefaultAddress)
route.get('/api/showAddress',addressController.showAddress)
route.post('/api/updateDefaultAddress', addressController.updateDefaultAddress);
route.delete('/api/deleteAddress',addressController.deleteAddress)
route.get('/api/getAddress',addressController.getAddress)
route.post('/api/updateAddress',addressController.updateAddress)
// route.get('/api/session/:sessionId',orderController.getSessionAndPaymentIntent)

module.exports = route;