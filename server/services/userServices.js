const axios = require('axios');
const { render } = require('ejs');

exports.homeRoutes = (req,res,next)=>{
    const {isUserAuthenticated,isUserAuth}= req.session
    axios.get(`http://localhost:${process.env.PORT}/admin/categoryShow`)
    .then(function (response){
        console.log(response.data);
        res.render("user/index",{categories: response.data,isUserAuthenticated,isUserAuth });
    })
    .catch(err => {
        res.render('error', { error: err });
        res.send(err);
    });
}
exports.about = (req,res,next)=>{
    res.render("user/about",(err,html)=>{
        if(err){
           console.log(err);
        }
        res.send(html)
     })
}
exports.contact = (req,res,next)=>{
    res.render("user/contact",(err,html)=>{
        if(err){
           console.log(err);
        }
        res.send(html)
     })
}

exports.signIn=(req,res)=>{
    const {validEmail,wrongPassword,isUserAuthenticated} = req.session
    res.render("user/signIn",{validEmail,wrongPassword,isUserAuthenticated},(err,html)=>{
       if(err){
          console.log(err);
       }
       delete req.session.validEmail
       delete req.session.wrongPassword
       res.send(html)
    })
 } 

exports.signUp=(req,res)=>{
    const {foundEmail,isUserAuthenticated} = req.session;
    res.render("user/signUp",{isUserAuthenticated,foundEmail},(err,html)=>{
       if(err){
          console.log(err);
       }
       delete req.session.isUserAuthenticated
       delete req.session.foundEmail
       res.send(html)
    })
}


exports.ourMenuList = async (req, res) => {
    try {
        const {isUserAuthenticated,isUserAuth}= req.session
        const category = req.query.category || 'Starters';
        const response = await axios.get(`http://localhost:${process.env.PORT}/api/ourMenuList?category=${category}`);
        
        if (response && response.data) {
            res.render('user/our-menu', {
                item: response.data.items,
                category: response.data.categories,
                selectedCategory: response.data.selectedCategory,
                cartDetails: response.data.cartDetails || [],
                isUserAuthenticated,
                isUserAuth
            });
        } else {
            res.redirect('/'); // Redirect if no data
        }
    } catch (err) {
        console.error('Error fetching menu list:', err);
        res.status(500).send('Error fetching data');
    }
};

exports.cart=(req,res)=>{
    const { isUserAuthenticated, message } = req.session;
    const userId = req.session.userId;
    console.log(userId);
    axios.get(`http://localhost:${process.env.PORT}/api/showCart?userId=${userId}`)
        .then((response) => {
            res.render("user/cart", {cart:response.data,isUserAuthenticated,message,userId});
            delete req.session.message;
        })
        .catch((err) => {
            console.error("Error fetching cart details:", err.message);
            res.status(err.response?.status || 500).send('Failed to load cart. Please try again later.');
        });
}
