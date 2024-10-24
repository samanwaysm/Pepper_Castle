const express = require('express');
const route = express.Router();
const session = require('express-session');
const axios = require('axios')
const store = require('../middleware/multer')

const {isAdminAuthenticated,isAdminNotAuthenticated} = require('../middleware/adminAuth');

const services = require('../render/adminServices');
const controller = require('../controller/adminSide/adminContoller');

// Admin
// route.get("/adminLogin",services.adminLogin);
// route.get("/adminLogin1",isAdminNotAuthenticated,services.adminLogin1);
// route.get("/adminDash",isAdminAuthenticated,services.adminDash);
// route.get("/adminUserMange",isAdminAuthenticated,services.adminUserManagement)


route.get("/adminlogin",isAdminNotAuthenticated,services.adminLogin)
route.get("/dashboard",isAdminAuthenticated,services.dashboard)
route.get("/categoryManagement",isAdminAuthenticated,services.categoryManagement)
route.get("/addCategory",isAdminAuthenticated,services.addCategory)
route.get("/editCategory",isAdminAuthenticated,services.editCategory)
route.get("/unlistCategory",isAdminAuthenticated,services.unlistCategory)
route.get("/itemManagement",isAdminAuthenticated,services.itemMangement)
route.get("/unlistItem",isAdminAuthenticated,services.unlistItem)
route.get("/addItem",isAdminAuthenticated,services.addItem)
route.get("/editItem",isAdminAuthenticated,services.editItem)
route.get("/userManagement",isAdminAuthenticated,services.userManagement)
route.get("/orderManagement",isAdminAuthenticated,services.orderManagement)
route.get("/orderDetail",isAdminAuthenticated,services.orderDetail)
route.get('/table-management',isAdminAuthenticated,services.tableManagement)
route.get('/table-booking-completed',isAdminAuthenticated,services.tableBookingCompleted)
route.get('/table-accepted-list',isAdminAuthenticated,services.tableBookingAccepted)

// API

route.post("/admin/adminlogin",controller.adminLogin);
route.get("/admin/logout",controller.adminLogout);
route.get("/admin/categoryShow",controller.CategoryManagementShow);

route.get("/admin/searchCategories",controller.searchCategories);

route.post("/admin/addCategory",controller.addCategory);
route.get("/admin/editCategoryShow",controller.editCategoryShow);
route.post('/admin/editCategory',controller.editCategory);
route.get('/admin/unlistCategory',controller.unlistCategory);
route.get("/admin/unlistcategoryShow",controller.UnlistCategoryShow)
route.get('/admin/listCategory',controller.listCategory);
route.get('/admin/searchOrders',controller.searchOrders);

route.get("/admin/itemShow",controller.itemManagementShow);
route.get("/admin/searchItems",controller.itemSearch);

route.post("/admin/addItem", store.array('image',1) ,controller.addItem);
route.get("/admin/unlistItemShow",controller.unlistItemShow)
route.get('/admin/unlistItem',controller.unlistItem);
route.get('/admin/listItem',controller.listItem);
route.get('/admin/editItemShow',controller.editItemShow);
route.post('/admin/editItem', store.array('image',1), controller.editItem);




route.get('/admin/userManagementShow',controller.userManagement);
route.get('/admin/searchUsers',controller.searchUsers);

route.post('/admin/updateUserStatus',controller.updateUserStatus);

route.get('/admin/getAllOrders',controller.getAllOrders);
route.get('/admin/getOrderDetails',controller.getOrderDetails);

route.post('/admin/updateStatus', controller.updateOrderStatus);
// route.post('/admin/refundPayment',controller.refundPayment)

route.get('/api/table-booking-data', controller.tableBookingData);
route.post('/api/updateStatus', controller.updateTableBooking);

module.exports = route;