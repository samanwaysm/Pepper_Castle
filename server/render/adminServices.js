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

exports.adminSignIn = (req, res) => {
    // const { validEmail, wrongPassword, isUserAuthenticated } = req.session
    res.render("admin/adminSignIn", (err, html) => {
        if (err) {
            console.log(err);
        }
        res.send(html)
    })
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
    res.render("admin/addCategory",(err,html)=>{
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
    const id=req.query.id;
    axios.get(`http://localhost:${process.env.PORT}/admin/editCategoryShow?id=${id}`) 
    .then(function (response){
        res.render("admin/editCategory",{category: response.data,message: req.session.categoryerr });
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
    axios.get(`http://localhost:${process.env.PORT}/admin/categoryShow`)
    .then(function (response){
        res.render("admin/addItem",{category: response.data });
    })
    .catch(err => {
        res.render('error', { error: err });
        res.send(err);
    });
}

exports.editItem=(req,res)=>{
    const id=req.query.id
    axios.all([
     axios.get(`http://localhost:${process.env.PORT}/admin/editItemShow?id=${id}`) ,
     axios.get(`http://localhost:${process.env.PORT}/admin/categoryShow`) 
  ])
  .then(axios.spread((data1,data2)=>{
     res.render("admin/editItem",{product:data1.data,category:data2.data}) 
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