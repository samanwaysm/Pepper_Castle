const express = require('express');
const route = express.Router();
const session = require('express-session');
const axios = require('axios')
const store = require('../middleware/multer')

// const {isAdminAuthenticated,isAdminNotAuthenticated} = require('../middleware/middleware');

const services = require('../services/adminServices');
const controller = require('../controller/adminSide/adminContoller');

// Admin
// route.get("/adminLogin",services.adminLogin);
// route.get("/adminLogin1",isAdminNotAuthenticated,services.adminLogin1);
// route.get("/adminDash",isAdminAuthenticated,services.adminDash);
// route.get("/adminUserMange",isAdminAuthenticated,services.adminUserManagement)

route.get("/adminCategoryMange",services.adminCategoryMangement)
route.get("/adminAddCategory",services.adminAddCategory)
// route.get("/adminUnlistCategory",services.adminUnlistCategory)
route.get("/adminEditCategory",services.adminEditCategory)

route.get("/adminItemManagement",services.adminItemMangement)
// route.get("/adminUnlistProduct",services.adminUnlistProduct)
route.get("/adminAddItem",services.adminAddItem)
// route.get("/adminEditProduct",services.adminEditProduct)
// route.get("/adminOrderMange",services.adminOrderMange)



// API
route.get("/admin/categoryShow",controller.CategoryManagementShow);
route.post("/admin/addCategory",controller.addCategory);
route.get("/admin/editCategoryShow",controller.editCategoryShow);
route.post('/admin/editCategory',controller.editCategory);

route.get("/admin/itemShow",controller.itemManagementShow);
route.post("/admin/addItem", store.array('image',1) ,controller.addItem);




module.exports = route;