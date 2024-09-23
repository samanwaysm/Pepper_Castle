const mongoose = require("mongoose");

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

        const cartDetails = await cartDb.aggregate([
            {
                $match: { userId: new mongoose.Types.ObjectId(userId) }
            },
            {
                $unwind: "$cartItems"
            },
            {
                $lookup: {
                    from: "items", // The collection name should match the MongoDB collection name
                    localField: "cartItems.itemId",
                    foreignField: "_id",
                    as: "itemDetails"
                }
            },
            {
                $unwind: "$itemDetails"
            },
            {
                $project: {
                    _id: 1,
                    "itemDetails.item": 1,
                    "itemDetails.price": 1,
                    "itemDetails.image": 1,
                    "cartItems.quantity": 1,
                    "cartItems.itemId": 1
                }
            }
        ]);

        if (!cartDetails.length) {
            return res.status(404).send('Cart not found');
        }

        console.log(cartDetails);
        res.send(cartDetails);

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

// exports.updateCart = async (req, res) => {
//     // console.log('Request body:', req.body);
//     try {
//         const { itemId, action, userId } = req.body;
//         let cart = await cartDb.findOne({ userId });

//         if (!cart) {
//             return res.status(404).json({ success: false, message: 'Cart not found' });
//         }

//         const item = cart.cartItems.find(ci => ci.itemId.toString() === itemId);

//         if (!item) {
//             return res.status(404).json({ success: false, message: 'Item not found in cart' });
//         }

//         // Update the item quantity based on the action
//         if (action === 'increase') {
//             item.quantity += 1;
//         } else if (action === 'decrease' && item.quantity > 1) {
//             item.quantity -= 1;
//         }

//         // Calculate the updated price
//         const itemDetails = await Item.findById(item.itemId); // Assuming you have a model for item details
//         const updatedPrice = itemDetails.price * item.quantity;

//         await cart.save();

//         // Send the updated quantity and price back to the client
//         res.json({
//             success: true,
//             newQuantity: item.quantity,
//             itemPrice: updatedPrice.toFixed(2) // Format the price to two decimal places
//         });
//     } catch (error) {
//         console.error("Error updating cart:", error.message);
//         res.status(500).json({ success: false, message: 'Internal Server Error' });
//     }
// };



exports.updateCart = async (req, res) => {
    const { itemId, action, userId } = req.body;

    try {
        const userCart = await cartDb.findOne({ userId: userId });

        if (!userCart) {
            return res.status(404).json({ success: false, message: "Cart not found." });
        }

        const itemIndex = userCart.cartItems.findIndex(item => item.itemId.toString() === itemId);

        if (itemIndex === -1) {
            return res.status(404).json({ success: false, message: "Item not found in cart." });
        }

        const cartItem = userCart.cartItems[itemIndex];

        // Fetch item details from the Item collection
        const itemDetails = await Item.findById(cartItem.itemId); // Make sure this is the correct way to fetch item details

        if (!itemDetails) {
            return res.status(404).json({ success: false, message: "Item details not found." });
        }

        // Update quantity based on action
        if (action === 'increase') {
            cartItem.quantity += 1;
        } else if (action === 'decrease') {
            cartItem.quantity -= 1;
        }

        // Prevent quantity from going below 1
        if (cartItem.quantity < 1) {
            cartItem.quantity = 1;
        }

        // Save the updated cart
        await userCart.save();

        // Send back the new quantity and item price
        const itemPrice = itemDetails.price * cartItem.quantity; // Use itemDetails to get the price
        return res.status(200).json({ success: true, newQuantity: cartItem.quantity, itemPrice });
    } catch (error) {
        console.error('Error updating cart:', error);
        return res.status(500).json({ success: false, message: "An error occurred." });
    }
};