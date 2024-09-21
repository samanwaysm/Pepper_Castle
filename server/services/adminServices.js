const session = require('express-session');
const axios = require('axios')

exports.adminCategoryMangement=(req,res)=>{
    axios.get(`http://localhost:${process.env.PORT}/admin/categoryShow`)
    .then(function (response){
        res.render("admin/adminCategoryManagement",{category: response.data });
    })
    .catch(err => {
        res.send(err);
    });
}

exports.adminAddCategory=(req,res)=>{
    res.render("admin/adminAddCategory",(err,html)=>{
        if(err){
            console.log('render err',err);
            return res.send('Internal server  err');
        }
        res.send(html);
    });
}

// exports.adminUnlistCategory=(req,res)=>{
//     axios.get(`http://localhost:${process.env.PORT}/admin/unlistcategoryShow`)
//     .then(function (response){
//         res.render("admin/adminUnlistCategory",{category: response.data });
//     })
//     .catch(err => {
//         res.render('error', { error: err });
//         res.send(err);
//     });
// }

exports.adminEditCategory=(req,res)=>{
    const id=req.query.id;
    axios.get(`http://localhost:${process.env.PORT}/admin/editCategoryShow?id=${id}`) 
    .then(function (response){
        res.render("admin/adminEditCategory",{category: response.data,message: req.session.categoryerr });
    })
    .catch(err => {
        res.render('error', { error: err });
        res.send(err); 
        delete req.session.categoryerr
    });
}

exports.adminItemMangement=(req,res)=>{
    axios.get(`http://localhost:${process.env.PORT}/admin/itemShow`)
    .then(function (response){
        res.render("admin/adminItemManagement",{item: response.data });
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

// exports.adminEditProduct=(req,res)=>{
//     // res.render("adminEditProduct")
//     const id=req.query.id
//     axios.all([
//      axios.get(`http://localhost:${process.env.PORT}/admin/editProductShow?id=${id}`) ,
//      axios.get(`http://localhost:${process.env.PORT}/admin/categoryShow`) 
//   ])
//   .then(axios.spread((data1,data2)=>{
//      res.render("adminside/adminEditProduct",{product:data1.data,category:data2.data}) 
//   })).catch(err=>{
//      res.send(err)
//   })
// }

exports.adminUnlistProduct=(req,res)=>{
    axios.get(`http://localhost:${process.env.PORT}/admin/unlistProductShow`)
    .then(function (response){
        res.render("admin/adminUnlistProduct",{product: response.data });
    })
    .catch(err => {
        res.render('error', { error: err });
        res.send(err);
    });
}