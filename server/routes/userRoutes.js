const express = require('express');
const route = express.Router();
const session = require('express-session');
const axios = require('axios')
const store = require('../middleware/multer')

// const {isAdminAuthenticated,isAdminNotAuthenticated} = require('../middleware/middleware');

const services = require('../services/userServices');
const controller = require('../controller/userSide/userController');
const categoryAndItemContoller = require('../controller/userSide/categoryAndItemContoller');
const cartController = require('../controller/userSide/cartController');

route.get('/',services.homeRoutes)
route.get('/signin',services.signIn)
route.get('/signup',services.signUp)
route.get('/about',services.about)
route.get('/contact',services.contact)
route.get('/our-menu',services.ourMenuList)
route.get('/cart',services.cart)

// APIs
route.post('/api/signup',controller.signUp)
route.post('/api/signin',controller.signIn)   // Login 
// route.post('/api/logout',controller.userLogout)   // Logout

// route.get('/api/',categoryAndItemContoller.homeCategoryShow)
route.get('/api/ourMenuList',categoryAndItemContoller.ourMenuList)
route.get('/api/addToCart',cartController.addToCart)
route.get('/api/showCart',cartController.showCart)
route.post('/api/update-cart',cartController.updateCart)
route.delete('/api/remove-from-cart',cartController.removeCart)


module.exports = route;