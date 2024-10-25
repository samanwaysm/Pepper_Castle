const express = require('express');
const route = express.Router();
const session = require('express-session');
const axios = require('axios')
const store = require('../middleware/multer')
const bodyParser = require('body-parser');


const {isUserAuthenticated,isUserNotAuthenticated} = require('../middleware/userAuth');
const { isCart, isOrderSuccess } = require('../middleware/middlewares');
const { jsonParser ,rawBodyParser} = require('../middleware/stripeRawBody');

const services = require('../render/userServices');
const controller = require('../controller/userSide/userController');
const categoryAndItemContoller = require('../controller/userSide/categoryAndItemController');
const cartController = require('../controller/userSide/cartController');
const addressController = require('../controller/userSide/addressController');
const orderController = require('../controller/userSide/orderController');
const webhookController = require('../controller/userSide/webhookController');
const tableBookingController = require('../controller/userSide/tableBookingController');

route.get('/signin',isUserNotAuthenticated,services.signin)
route.get('/signup',isUserNotAuthenticated,services.signUp)
route.get('/forgot-password',isUserNotAuthenticated,services.forgotPassword)
route.get('/otp-verification',isUserNotAuthenticated,services.otpVerification)
route.get('/reset-password',isUserNotAuthenticated,services.resetPassword)
route.get('/',services.homeRoutes)
route.get('/about',services.about)
route.get('/contact',services.contact)
route.get('/testimonials',services.testimonials)
route.get('/our-menu',services.ourMenuList)
route.get('/cart',isUserAuthenticated,services.cart)
route.get('/checkout',isUserAuthenticated,isCart,services.checkout)
route.get('/orderSuccess',isUserAuthenticated,services.orderSuccess)
route.get('/orderFailed',services.orderFailed)
route.get('/profile',isUserAuthenticated,services.profile)
route.get('/manage-address',isUserAuthenticated,services.manageAddress)
route.get('/orders-list',isUserAuthenticated,services.ordersList)
route.get('/change-password',isUserAuthenticated,services.changePassword)

// APIs

// AUTH User
route.post('/api/signup',controller.signUp)   // Signup 
route.post('/api/signin',controller.signIn)   // Login 

route.get('/api/logout',controller.signOut)   // Logout

route.post('/api/generateotp',controller.forgotOtp)
route.post('/api/otpverification',controller.forgototpverification)
route.post('/api/updatepassword',controller.updatepassword)

route.get('/api/forgotOtpResend',controller.forgotOtpResend)

route.post('/api/changePassword',controller.changePassword)
route.post('/api/changeProfile',controller.changeProfile)

route.post('/api/getLocationDetails',controller.getLocationDetails);

// Our Manu 
route.get('/api/homeCategoryShow',categoryAndItemContoller.homeCategoryShow)
route.get('/api/ourMenuList',categoryAndItemContoller.ourMenuList)
route.get('/api/itemCount',cartController.getCartItemCount)

// Cart
route.post('/api/update-cart',cartController.updateCart)

route.get('/api/addToCart',cartController.addToCart)
route.get('/api/showCart',cartController.showCart)

route.delete('/api/remove-from-cart',cartController.removeCart)


// Address
route.post('/api/addAddress', addressController.addAddress);
route.post('/api/updateAddress',addressController.updateAddress)
route.get('/api/showDefaultAddress',addressController.showDefaultAddress)
route.get('/api/showAddress',addressController.showAddress)
route.post('/api/updateDefaultAddress', addressController.updateDefaultAddress);
route.get('/api/getAddress',addressController.getAddress)
route.get('/api/showAddressManagement',addressController.showAddressManagement)
route.delete('/api/deleteAddress',addressController.deleteAddress)

// Order Section
route.post('/api/create-order',orderController.createOrder)
route.get('/api/orderslist', orderController.orderslist);
route.get('/api/getUserDetails',controller.getUserDetails)
// route.get('/api/success',orderController.handlePaymentSuccess)

// Location Checking
route.post('/api/getGoogleMaplocation',controller.getGoogleMaplocation)



// Webhook <- Order Section
route.post('/webhook',express.raw({ type: 'application/json' }),webhookController.webhook);

// Table Booking 
route.post('/api/book-table',tableBookingController.bookTable)


module.exports = route;