const express = require('express');
const route = express.Router();
const session = require('express-session');
const axios = require('axios')
const store = require('../middleware/multer')

// const {isAdminAuthenticated,isAdminNotAuthenticated} = require('../middleware/middleware');

const services = require('../render/adminServices');
const controller = require('../controller/adminSide/adminContoller');

// Admin
// route.get("/adminLogin",services.adminLogin);
// route.get("/adminLogin1",isAdminNotAuthenticated,services.adminLogin1);
// route.get("/adminDash",isAdminAuthenticated,services.adminDash);
// route.get("/adminUserMange",isAdminAuthenticated,services.adminUserManagement)


route.get("/adminlogin",services.adminLogin)

route.get("/dashboard",services.dashboard)
route.get("/categoryManagement",services.categoryManagement)
route.get("/addCategory",services.addCategory)
route.get("/editCategory",services.editCategory)
route.get("/unlistCategory",services.unlistCategory)

route.get("/itemManagement",services.itemMangement)
route.get("/unlistItem",services.unlistItem)
route.get("/addItem",services.addItem)



// API

route.post("/admin/adminlogin",controller.adminLogin);

route.get("/admin/categoryShow",controller.CategoryManagementShow);
route.post("/admin/addCategory",controller.addCategory);
route.get("/admin/editCategoryShow",controller.editCategoryShow);
route.post('/admin/editCategory',controller.editCategory);
route.get('/admin/unlistCategory',controller.unlistCategory);
route.get("/admin/unlistcategoryShow",controller.UnlistCategoryShow)
route.get('/admin/listCategory',controller.listCategory);



route.get("/admin/itemShow",controller.itemManagementShow);
route.post("/admin/addItem", store.array('image',1) ,controller.addItem);
route.get("/admin/unlistItemShow",controller.unlistItemShow)
route.get('/admin/unlistItem',controller.unlistItem);
route.get('/admin/listItem',controller.listItem);



module.exports = route;