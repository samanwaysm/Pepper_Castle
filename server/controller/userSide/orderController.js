const mongoose = require("mongoose");
const { v4: uuidv4 } = require('uuid');
const moment = require('moment-timezone'); // Import moment-timezone


const OrderDb = require("../../model/orderSchema");
const cartDb = require("../../model/cartSchema");
const addressDb = require('../../model/addressSchema');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.createOrder = async (req, res, next) => {
    const { orderItems, paymentMethod, addressId, userId } = req.body; 
    try {
        const orderId =await generateOrderId();
        
        const addressData = await getAddress(userId, addressId)
        const address = addressData[0].address
        const {latitude, longitude, distanceInKilometers} = req.session
        
        const cartItems = await getCartItems(userId)

        let totalAmount = 0;
        const items = cartItems.map(item => {
            const { itemDetails, cartItems } = item;
            const { price, item: itemName, image } = itemDetails;
            const { quantity } = cartItems;
            totalAmount += price * quantity;

            return {
                item: itemName,
                quantity,
                price,
                image
            };
        });

        const { username, phone, street, block, unitnum, postal, structuredAddress } = addressData[0].address;
        
        const newOrder = new OrderDb({
            user: userId,
            orderId,
            items,
            paymentMethod,
            address: {
                username,
                phone,
                street,
                block,
                unitnum,
                postal,
                structuredAddress,
                latitude,
                longitude,
                distanceInKilometers
            },
            totalAmount,
            paymentStatus: 'pending' 
        });
        
        const savedOrder = await newOrder.save();
        console.log(req.headers.origin);
        

        const orderIdStr = savedOrder._id ? savedOrder._id.toString() : null;
        const userIdStr = userId.toString();

        if (paymentMethod === 'online') {
        
            const session = await stripe.checkout.sessions.create({
                line_items: cartItems.map(item => ({
                    price_data: {
                        currency: 'sgd',
                        product_data: {
                            name: item.itemDetails.item,
                        },
                        unit_amount: Math.round(item.itemDetails.price * 100)
                    },
                    quantity: item.cartItems.quantity
                })),
                mode: 'payment',
                // success_url: `http://localhost:${process.env.PORT}/orderSuccess`,
                // cancel_url: `http://localhost:${process.env.PORT}/orderFailed`,
                success_url: `${req.headers.origin}/orderSuccess`,
                cancel_url: `${req.headers.origin}/orderFailed`,
                // success_url: `https://pepper-castle.onrender.com/orderSuccess`,
                // cancel_url: `https://pepper-castle.onrender.com/orderFailed`,
                // success_url: `http://localhost:${process.env.PORT}/api/success?orderId=${savedOrder._id}&userId=${userId}`,
                // success_url: `https://pepper-castle.onrender.com/api/success?orderId=${savedOrder._id}&userId=${userId}`,
                payment_intent_data: {
                    metadata: {
                        orderId: savedOrder._id.toString(),
                        userId: userId.toString(),
                    }
                }
            });
        
            savedOrder.stripeSessionId = session.id;
            await savedOrder.save();
            return res.json({ success: true, paymentUrl: session.url, sessionId: session.id });
        } else {
            savedOrder.status = 'Ordered';
            savedOrder.completed = true
            req.session.ordersuccess = true
            await savedOrder.save();
            await cartDb.updateOne(
                { userId }, 
                { $set: { cartItems: [] } }
            );
            return res.status(200).json({ success: true, paymentUrl: '/orderSuccess' });
      }
    } catch (error) {
        console.error('Error fetching address data:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};


// const generateOrderId = () => {
//     const timestamp = Date.now().toString();
//     return `ORD-${timestamp}-${uuidv4()}`;
// };

// const generateOrderId = () => {
//     const timestamp = Date.now().toString();
//     const randomNum = Math.floor(Math.random() * 10000);
//     return `ORD-${timestamp}${randomNum}`;
// };

const generateOrderId = async () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'; 
    let orderId;
    let isUnique = false;
    while (!isUnique) {
        orderId = Array.from({ length: 8 + Math.floor(Math.random() * 2) }, () => characters.charAt(Math.floor(Math.random() * characters.length))).join('');
        const existingOrder = await OrderDb.findOne({ orderId });
        isUnique = !existingOrder; 
    }
    return `${orderId}`;
};

const getAddress = async (userId, addressId) => {
    return await addressDb.aggregate([
        {
            $match: {
                userId: new mongoose.Types.ObjectId(userId) 
            }
        },
        {
            $unwind: "$address" 
        },
        {
            $match: {
                "address._id": new mongoose.Types.ObjectId(addressId)
            }
        },
        {
            $project: {
                address: 1
            }
        }
    ]);
};

const getCartItems = async (userId) => {
    return await cartDb.aggregate([
        {
            $match: { userId: new mongoose.Types.ObjectId(userId) }
        },
        {
            $unwind: "$cartItems"
        },
        {
            $lookup: {
                from: "items",
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
}






// exports.handlePaymentSuccess = async (req, res) => {
//     try {
//       const { orderId,userId } = req.query;
//       const order = await OrderDb.findById(orderId);
//       if (!order) {
//         return res.status(404).json({ success: false, error: 'Order not found.' });
//       }
//         // const paymentIntent = await stripe.paymentIntents.retrieve(order.stripeSessionId);
  
//       order.paymentStatus = 'success';
//       order.status = 'Ordered';
//       order.completed = true
//       await order.save();
      
      

//       await cartDb.updateOne(
//         { userId: order.user }, 
//         { $set: { cartItems: [] } }
//       );
      
//       res.redirect('/orderSuccess')
//     //   return res.json({ success: true, message: 'Payment successful and cart cleared.' });
//     } catch (error) {
//       console.error('Payment handling failed:', error);
//       return res.status(500).json({ success: false, error: 'Payment handling failed.' });
//     }
// };


// const handlePaymentSuccess = async (session) => { 
//     try {
//               const { orderId } = req.query;
//               console.log(orderId);
//               const order = await OrderDb.findById(orderId);
//               if (!order) {
//                 return res.status(404).json({ success: false, error: 'Order not found.' });
//               }
//                 // const paymentIntent = await stripe.paymentIntents.retrieve(order.stripeSessionId);
//                 // console.log('Payment Intent Details:', paymentIntent);
          
//               order.paymentStatus = 'success';
//               order.status = 'Ordered';
//               order.completed = true
//               await order.save();
//               console.log(order.user);
              
//               await cartDb.updateOne(
//                 { userId: order.user }, 
//                 { $set: { cartItems: [] } }
//               );
              
//               res.redirect('/orderSuccess')
//             //   return res.json({ success: true, message: 'Payment successful and cart cleared.' });
//             } catch (error) {
//               console.error('Payment handling failed:', error);
//               return res.status(500).json({ success: false, error: 'Payment handling failed.' });
//             }

// }




// exports.createOrder = async (req, res) => {
//   try {
//       const { orderItems, paymentMethod, address, userId } = req.body;

//       if (!userId || !orderItems || !paymentMethod || !address) {
//           return res.status(400).json({ success: false, error: 'Missing required fields.' });
//       }

//       let parsedOrderItems = orderItems;
//       if (typeof orderItems === 'string') {
//           try {
//               parsedOrderItems = JSON.parse(orderItems);
//           } catch (error) {
//               return res.status(400).json({ success: false, error: 'Invalid orderItems format.' });
//           }
//       }

//     //   console.log(parsedOrderItems);

//       if (!Array.isArray(parsedOrderItems) || parsedOrderItems.length === 0) {
//           return res.status(400).json({ success: false, error: 'orderItems should be a non-empty array.' });
//       }

//       const { username, phone, street, block, unitnum, postal, structuredAddress } = address;
//       if (!structuredAddress || !postal || !unitnum || !block || !street || !phone || !username) {
//           return res.status(400).json({ success: false, error: 'Incomplete address information.' });
//       }

//       let totalAmount = 0;
//       const items = parsedOrderItems.map(item => {
//           const { itemDetails, cartItems } = item;
//           const { price, item: itemName } = itemDetails;
//           const { quantity } = cartItems;

//           totalAmount += price * quantity;

//           return {
//               item: itemName,
//               quantity,
//               price
//           };
//       });

//       const newOrder = new OrderDb({
//           user: userId,
//           items,
//           paymentMethod,
//           address: {
//               username,
//               phone,
//               street,
//               block,
//               unitnum,
//               postal,
//               structuredAddress
//           },
//           totalAmount,
//           paymentStatus: 'pending' 
//       });

//       const savedOrder = await newOrder.save();

//       if (paymentMethod === 'online') {
//           const session = await stripe.checkout.sessions.create({
//               line_items: parsedOrderItems.map(item => ({
//                   price_data: {
//                       currency: 'sgd',
//                       product_data: {
//                           name: item.itemDetails.item,
//                       },
//                       unit_amount: item.itemDetails.price * 100
//                   },
//                   quantity: item.cartItems.quantity
//               })),
//               mode: 'payment',
//                 success_url: `http://localhost:${process.env.PORT}/api/success?orderId=${savedOrder._id}`,
//                 cancel_url: `https://example.com/cancel?orderId=${savedOrder._id}`
//           });

//           savedOrder.stripeSessionId = session.id;
//           await savedOrder.save();
    
//           return res.json({ success: true, paymentUrl: session.url, sessionId: session.id });
//       } else {
//             // Remove items from the user's cart
//             await cartDb.updateOne(
//                 { userId }, 
//                 { $set: { cartItems: [] } }
//             );            
//             return res.json({ success: true, message: 'Order placed successfully with cash on delivery.' });
//       }

//   } catch (error) {
//       console.error('Order creation failed:', error);
//       return res.status(500).json({ success: false, error: 'Order creation failed.' });
//   }
// };



exports.orderslist = async (req, res) => {
    const userId = req.query.userId; // Assuming user ID is stored in req.user (after authentication)    
    try {
        const orders = await OrderDb.aggregate([
            { 
                $match: { 
                    user: new mongoose.Types.ObjectId(userId), 
                    completed: true
                }
            },
            {
                $project: {
                    orderId: 1,
                    items: 1, 
                    totalAmount: 1,
                    paymentMethod: 1,
                    paymentStatus: 1,
                    status: 1,
                    address: 1,
                    createdAt: {
                        $dateToString: {
                            format: "%Y-%m-%d %H:%M:%S",
                            date: { $dateAdd: { startDate: "$createdAt", unit: "hour", amount: 8 } } // Convert UTC to Singapore Time (+8 hours)
                        }
                    }
                }
            }
        ]);

        // Check if orders exist
        if (!orders.length) {
            return res.status(404).json({ message: 'No orders found for this user.' });
        }
        
        // Return the list of orders
        res.status(200).json({ orders });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'An error occurred while fetching orders.', error });
    }
}