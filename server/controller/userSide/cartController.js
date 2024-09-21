const User = require("../../model/userSchema");
const Category = require("../../model/categorySchema");
const Item = require("../../model/itemSchema");
const cartDb = require("../../model/cartSchema");

exports.addToCart = async (req, res) => {
    const itemId = req.query.id;
    const userId = req.session.userId;

    console.log('item id ', itemId);

    if (typeof userId === "undefined") {
        return res.redirect('/signin');
    }

    try {
        let cart = await cartDb.findOne({ userId: userId });

        if (!cart) {
            cart = new cartDb({
                userId: userId,
                cartItems: [{
                    itemId: itemId,
                    quantity: 1
                }]
            });
        } else {
            const itemIndex = cart.cartItems.findIndex(item => item.itemId.toString() === itemId);

            if (itemIndex > -1) {
                cart.cartItems[itemIndex].quantity += 1;
            } else {
                cart.cartItems.push({
                    itemId: itemId,
                    quantity: 1
                });
            }
        }

        await cart.save();
        res.redirect("/cart");

    } catch (err) {
        console.error("Error adding to cart:", err.message);
        res.status(400).send({
            message: err.message || "Some error occurred while adding the item to the cart."
        });
    }
};


    
exports.showCart = async (req, res) => {
    try {
        const userId = req.query.userId;
        console.log('showcart', userId);
        
        const cartDetails = await cartDb.findOne({ userId: userId }).populate({
            path: 'cartItems.itemId',
            model: 'Item'
        });

        if (!cartDetails) {
            return res.status(404).send('Cart not found');
        }

        console.log(cartDetails);
        res.send(cartDetails)
        // Render the cart.ejs view
        // return res.render('cart', { cart: cartDetails });

    } catch (error) {
        console.error("Error displaying cart:", error.message);
        res.status(500).send('Internal Server Error');
    }
}


exports.removeCart = async (req, res) => {
    const userId = req.session.userId
    const productId = req.query.pid
    console.log(productId)
    try {
          const cart = await cartDb.findOne({ userId: userId })
          const index = cart.cartItems.findIndex((value) => {
                return value.productId.toString() === productId;
          });
          cart.cartItems.splice(index, 1)
          await cart.save()
          res.redirect('/userCart')
    } catch (err) {
          res.status(500).send(err)
    }
}

exports.updateCart = async (req, res) => {
    try {
        const { itemId, action } = req.body;
        const userId = req.user._id;

        let cart = await cartDb.findOne({ userId });

        if (!cart) {
            return res.status(404).json({ success: false, message: 'Cart not found' });
        }

        const item = cart.cartItems.find(ci => ci.itemId.toString() === itemId);

        if (!item) {
            return res.status(404).json({ success: false, message: 'Item not found in cart' });
        }

        if (action === 'increase') {
            item.quantity += 1;
        } else if (action === 'decrease' && item.quantity > 1) {
            item.quantity -= 1;
        }

        await cart.save();

        res.json({ success: true, cart });
    } catch (error) {
        console.error("Error updating cart:", error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};


