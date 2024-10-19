const axios = require('axios');
const { render } = require('ejs');

exports.homeRoutes = (req, res, next) => {
    const { isUserAuthenticated, isUserAuth, userId } = req.session
    axios.all([
        axios.get(`http://localhost:${process.env.PORT}/admin/categoryShow`),
        axios.get(`http://localhost:${process.env.PORT}/api/itemCount?userId=${userId}`),
    ])
        .then(axios.spread((data1, data2) => {
            res.render("user/index", { categories: data1.data, cartCount: data2.data, isUserAuthenticated, isUserAuth }, (err, html) => {
                if (err) {
                    console.log(err);
                }
                res.send(html)
            })

        })).catch(err => {
            res.send(err)
        })
    // axios.get(`http://localhost:${process.env.PORT}/admin/categoryShow`)
    //     .then(function (response) {
    //         console.log(response.data);
    //         res.render("user/index", { categories: response.data, isUserAuthenticated, isUserAuth });
    //     })
    //     .catch(err => {
    //         res.render('error', { error: err });
    //         res.send(err);
    //     });
}
exports.about = (req, res, next) => {
    const { isUserAuthenticated, isUserAuth, userId } = req.session
    res.render("user/about",{ isUserAuthenticated, isUserAuth, userId }, (err, html) => {
        if (err) {
            console.log(err);
        }
        res.send(html)
    })
}
exports.contact = (req, res, next) => {
    const { isUserAuthenticated, isUserAuth, userId } = req.session
    res.render("user/contact",{ isUserAuthenticated, isUserAuth, userId }, (err, html) => {
        if (err) {
            console.log(err);
        }
        res.send(html)
    })
}

exports.testimonials = (req, res, next) => {
    const { isUserAuthenticated, isUserAuth, userId } = req.session
    res.render("user/testimonials",{ isUserAuthenticated, isUserAuth, userId }, (err, html) => {
        if (err) {
            console.log(err);
        }
        res.send(html)
    })
}

exports.signin = (req, res) => {
    const {isUserAuthenticated, errors } = req.session
    delete req.session.errors 
    res.render("user/signin", { isUserAuthenticated, errors }, (err, html) => {
        if (err) {
            console.log(err);
        }
        res.send(html)
    })
}

exports.signUp = (req, res) => {
    const { foundEmail, isUserAuthenticated, errors } = req.session;
    delete req.session.errors 
    res.render("user/signup", { isUserAuthenticated, foundEmail, errors}, (err, html) => {
        if (err) {
            console.log(err);
        }
        delete req.session.isUserAuthenticated
        delete req.session.foundEmail
        res.send(html)
    })
}


exports.ourMenuList = async (req, res) => {
    const { isUserAuthenticated, isUserAuth, userId } = req.session
    const category = req.query.category || 'Starters';
    axios.all([
        axios.get(`http://localhost:${process.env.PORT}/api/ourMenuList?category=${category}`),
        axios.get(`http://localhost:${process.env.PORT}/api/itemCount?userId=${userId}`),
    ])
        .then(axios.spread((data1, data2) => {
            res.render("user/our-menu", {
                item: data1.data.items,
                category: data1.data.categories,
                selectedCategory: data1.data.selectedCategory,
                cartDetails: data1.data.cartDetails || [],
                cartCount: data2.data,
                isUserAuthenticated,
                isUserAuth,
                userId
            }, (err, html) => {
                if (err) {
                    console.log(err);
                }
                res.send(html)
            })

        })).catch(err => {
            res.send(err)
        })
};

// exports.cart = (req, res) => {
//     const { isUserAuthenticated,isUserAuth, message } = req.session;
//     const userId = req.session.userId;
//     axios.get(`http://localhost:${process.env.PORT}/api/showCart?userId=${userId}`)
//         .then((response) => {
//             res.render("user/cart", { cart: response.data, isUserAuthenticated, message, userId });
//             delete req.session.message;
//         })
//         .catch((err) => {
//             console.error("Error fetching cart details:", err.message);
//             res.status(err.response?.status || 500).send('Failed to load cart. Please try again later.');
//         });
// }


exports.cart = (req, res) => {
    const { isUserAuthenticated, isUserAuth, message } = req.session;
    const userId = req.session.userId;
    axios.get(`http://localhost:${process.env.PORT}/api/showCart?userId=${userId}`)
        .then((response) => {
            res.render("user/cart", { cart: response.data, isUserAuthenticated, message, userId, isUserAuth });
            delete req.session.message;
        })
        .catch((err) => {
            res.render("user/cart", { cart: [], isUserAuthenticated, err, userId, isUserAuth });
            // res.status(err.response?.status || 500).send('Failed to load cart. Please try again later.');
        });
}

exports.checkout = (req, res) => {
    const { isUserAuthenticated, isUserAuth, userId } = req.session
    axios.all([
        axios.get(`http://localhost:${process.env.PORT}/api/showCart?userId=${userId}`),
        axios.get(`http://localhost:${process.env.PORT}/api/showDefaultAddress?userId=${userId}`),
    ])
        .then(axios.spread((data1, data2) => {
            res.render("user/checkout", { 
                cartDetails: data1.data, 
                address: data2.data, 
                isUserAuthenticated,
                isUserAuth, 
                userId
             }, (err, html) => {
                if (err) {
                    console.log(err);
                }
                res.send(html)
            })

        })).catch(err => {
            res.send(err)
        })
}


exports.orderSuccess = (req, res) => {
    const { isUserAuthenticated, isUserAuth, userId, username } = req.session
    res.render("user/orderSuccess",{isUserAuth,userId}, (err, html) => {
        if (err) {
            console.log(err);
        }
        delete req.session.validEmail
        delete req.session.wrongPassword
        res.send(html)
    })
}


exports.forgotPassword = (req, res, next) => {
    res.render("user/forgot-password", (err, html) => {
        if (err) {
            console.log(err);
        }
        res.send(html)
    })
}

exports.otpVerification = (req, res, next) => {
    const { rTime } = req.session
    res.render("user/otp-verification",{rTime}, (err, html) => {
        if (err) {
            console.log(err);
        }
        res.send(html)
    })
}

exports.resetPassword = (req, res, next) => {
    res.render("user/reset-password", (err, html) => {
        if (err) {
            console.log(err);
        }
        res.send(html)
    })
}

// exports.profile = (req, res, next) => {
//     const { isUserAuthenticated, isUserAuth, userId } = req.session
//     res.render("user/change",{isUserAuth,userId}, (err, html) => {
//         if (err) {
//             console.log(err);
//         }
//         res.send(html)
//     })
// }

exports.manageAddress = (req, res, next) => {
    const { isUserAuthenticated, isUserAuth, userId, username } = req.session
    res.render("user/manage-address",{isUserAuth,userId,username}, (err, html) => {
        if (err) {
            console.log(err);
        }
        res.send(html)
    })
}

exports.ordersList = (req, res, next) => {
    const { isUserAuthenticated, isUserAuth, userId ,username} = req.session
    res.render("user/orders-list",{isUserAuth,userId,username}, (err, html) => {
        if (err) {
            console.log(err);
        }
        res.send(html)
    })
}

exports.changePassword = (req, res, next) => {
    const { isUserAuthenticated, isUserAuth, userId, username, errors } = req.session
    delete req.session.errors 
    res.render("user/change-password",{isUserAuth,userId,username,errors }, (err, html) => {
        if (err) {
            console.log(err);
        }
        res.send(html)
    })
}

// exports.profile = (req, res, next) => {
//     const { isUserAuthenticated, isUserAuth, userId } = req.session
//     res.render("user/profile",{isUserAuth,userId}, (err, html) => {
//         if (err) {
//             console.log(err);
//         }
//         res.send(html)
//     })
// }

exports.profile = (req, res) => {
    const { isUserAuthenticated, isUserAuth, userId,username,errors } = req.session
    delete req.session.errors 
    axios.get(`http://localhost:${process.env.PORT}/api/getUserDetails?userId=${userId}`)
        .then((response) => {
            res.render("user/profile", { user: response.data, isUserAuthenticated,isUserAuth,userId,username,errors });
        })
        .catch((err) => {
            console.error("Error fetching user details:", err.message);
            res.status(err.response?.status || 500).send('Failed to load user. Please try again later.');
        });
}

// exports.profile = (req, res, next) => {
//     const { isUserAuthenticated, isUserAuth, userId } = req.session
//     res.render("user/profile",{isUserAuth,userId}, (err, html) => {
//         if (err) {
//             console.log(err);
//         }
//         res.send(html)
//     })
// }