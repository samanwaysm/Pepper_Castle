const session = require('express-session');
const axios = require('axios')

// exports.adminCategoryMangement=(req,res)=>{
//     axios.get(`http://localhost:${process.env.PORT}/admin/categoryShow`)
//     .then(function (response){
//         res.render("admin/adminCategoryManagement",{category: response.data });
//     })
//     .catch(err => {
//         res.send(err);
//     });
// }

exports.adminLogin = (req, res) => {
    // const { validEmail, wrongPassword, isUserAuthenticated } = req.session
    res.render("admin/adminlogin", (err, html) => {
        if (err) {
            console.log(err);
        }
        res.send(html)
    })
}


exports.dashboard = (req, res) => {
    // const { validEmail, wrongPassword, isUserAuthenticated } = req.session
    res.render("admin/dashboard", (err, html) => {
        if (err) {
            console.log(err);
        }
        res.send(html)
    })
}

exports.tableManagement = (req, res) => {
    // const { validEmail, wrongPassword, isUserAuthenticated } = req.session
    res.render("admin/tableManagement", (err, html) => {
        if (err) {
            console.log(err);
        }
        res.send(html)
    })
}

exports.tableBookingCompleted = (req, res) => {
    // const { validEmail, wrongPassword, isUserAuthenticated } = req.session
    res.render("admin/tableBookingCompleted", (err, html) => {
        if (err) {
            console.log(err);
        }
        res.send(html)
    })
}

exports.tableBookingAccepted = (req, res) => {
    // const { validEmail, wrongPassword, isUserAuthenticated } = req.session
    res.render("admin/tableAcceptedList", (err, html) => {
        if (err) {
            console.log(err);
        }
        res.send(html)
    })
}
// exports.userManagement = (req, res) => {
//     // const { validEmail, wrongPassword, isUserAuthenticated } = req.session
//     res.render("admin/userManagement", (err, html) => {
//         if (err) {
//             console.log(err);
//         }
//         res.send(html)
//     })
// }

exports.userManagement=(req,res)=>{
    axios.get(`http://localhost:${process.env.PORT}/admin/userManagementShow`)
    .then(function (response){
        res.render("admin/userManagement",{users: response.data});
    })
    .catch(err => {
        res.send(err);
    });
}


exports.categoryManagement=(req,res)=>{
    axios.get(`http://localhost:${process.env.PORT}/admin/categoryShow`)
    .then(function (response){
        res.render("admin/categoryManagement",{categories: response.data});
    })
    .catch(err => {
        res.send(err);
    });
}

// exports.adminAddCategory=(req,res)=>{
//     res.render("admin/adminAddCategory",(err,html)=>{
//         if(err){
//             console.log('render err',err);
//             return res.send('Internal server  err');
//         }
//         res.send(html);
//     });
// }

exports.addCategory=(req,res)=>{
    const { errors } = req.session
    delete req.session.errors
    res.render("admin/addCategory",{errors},(err,html)=>{
        if(err){
            console.log('render err',err);
            return res.send('Internal server  err');
        }
        res.send(html);
    });
}
exports.unlistCategory=(req,res)=>{
    axios.get(`http://localhost:${process.env.PORT}/admin/unlistcategoryShow`)
    .then(function (response){
        res.render("admin/unlistCategory",{categories: response.data });
    })
    .catch(err => {
        res.render('error', { error: err });
        res.send(err);
    });
}

exports.editCategory=(req,res)=>{
    const { errors } = req.session
    delete req.session.errors
    const id=req.query.id;
    axios.get(`http://localhost:${process.env.PORT}/admin/editCategoryShow?id=${id}`) 
    .then(function (response){
        res.render("admin/editCategory",{category: response.data,message: req.session.categoryerr,errors });
    })
    .catch(err => {
        res.render('error', { error: err });
        res.send(err); 
        delete req.session.categoryerr
    });
}

// exports.adminItemMangement=(req,res)=>{
//     axios.get(`http://localhost:${process.env.PORT}/admin/itemShow`)
//     .then(function (response){
//         res.render("admin/adminItemManagement",{item: response.data });
//     })
//     .catch(err => {
//         res.render('error', { error: err });
//         res.send(err);
//     });
// }

exports.itemMangement=(req,res)=>{
    axios.get(`http://localhost:${process.env.PORT}/admin/itemShow`)
    .then(function (response){
        res.render("admin/itemManagement",{items: response.data });
    })
    .catch(err => {
        res.render('error', { error: err });
        res.send(err);
    });
}

exports.adminAddItem=(req,res)=>{
    axios.get(`http://localhost:${process.env.PORT}/admin/categoryShow`)
    .then(function (response){
        res.render("admin/adminAddItem",{category: response.data });
    })
    .catch(err => {
        res.render('error', { error: err });
        res.send(err);
    });
}

exports.addItem=(req,res)=>{
    const { errors } = req.session
    delete req.session.errors
    axios.get(`http://localhost:${process.env.PORT}/admin/categoryShow`)
    .then(function (response){
        res.render("admin/addItem",{category: response.data, errors });
    })
    .catch(err => {
        res.render('error', { error: err });
        res.send(err);
    });
}

exports.editItem=(req,res)=>{
    const { errors } = req.session
    delete req.session.errors
    const id=req.query.id
    axios.all([
     axios.get(`http://localhost:${process.env.PORT}/admin/editItemShow?id=${id}`) ,
     axios.get(`http://localhost:${process.env.PORT}/admin/categoryShow`) 
  ])
  .then(axios.spread((data1,data2)=>{
     res.render("admin/editItem",{item:data1.data,category:data2.data, errors}) 
  })).catch(err=>{
     res.send(err)
  })
}

exports.unlistItem=(req,res)=>{
    axios.get(`http://localhost:${process.env.PORT}/admin/unlistItemShow`)
    .then(function (response){
        res.render("admin/unlistItem",{items: response.data });
    })
    .catch(err => {
        res.render('error', { error: err });
        res.send(err);
    });
}

// exports.orderManagement=(req,res)=>{
//     res.render("admin/orderManagement",(err,html)=>{
//         if(err){
//             console.log('render err',err);
//             return res.send('Internal server  err');
//         }
//         res.send(html);
//     });
// }

exports.orderManagement=(req,res)=>{
    axios.get(`http://localhost:${process.env.PORT}/admin/getAllOrders`)
    .then(function (response){
        res.render("admin/orderManagement",{orders: response.data.orders});
    })
    .catch(err => {
        res.render('error', { error: err });
        res.send(err);
    });
}



exports.orderDetail=(req,res)=>{
    const { orderId } = req.query
    axios.get(`http://localhost:${process.env.PORT}/admin/getOrderDetails?orderId=${orderId}`)
    .then(function (response){
        res.render("admin/orderDetail",{order: response.data.order});
    })
    .catch(err => {
        res.render('error', { error: err });
        res.send(err);
    });
}
// exports.orderDetail=(req,res)=>{
//     res.render("admin/orderDetail",(err,html)=>{
//         if(err){
//             console.log('render err',err);
//             return res.send('Internal server  err');
//         }
//         res.send(html);
//     });
// }