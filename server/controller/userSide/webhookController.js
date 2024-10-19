const mongoose = require("mongoose");
const bodyParser = require('body-parser');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);


const OrderDb = require("../../model/orderSchema");
const cartDb = require("../../model/cartSchema");
const rawBody = require('raw-body');



exports.webhook = async (req, res) => {
    let event;

    // Stripe recommends disabling the body parser for this route and getting the raw body
    try {
        const payload =  JSON.stringify(req.body, null, 2);
        console.log('--------------------->',payload);
        
        const sig = req.headers['stripe-signature'];
        const header = stripe.webhooks.generateTestHeaderString({
                    payload: payload,
                    secret: process.env.STRIPE_WEBHOOK_SECRET,
                });

        // Construct the event from raw payload and signature
        event = stripe.webhooks.constructEvent(payload, header, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error('Webhook signature verification failed.', err);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Log event type
    console.log(`Event type: ${event.type}`);

    try {
        switch (event.type) {
            case 'payment_intent.succeeded': {
                const paymentIntent = event.data.object;
                console.log('Payment Intent succeeded:', paymentIntent);
                
                const orderId = paymentIntent.metadata.orderId;
                const userId = paymentIntent.metadata.userId;

                await handleOrderUpdate(orderId, userId, 'success');
                break;
            }
            case 'charge.updated': {
                const charge = event.data.object;
                console.log('Charge updated:', charge);

                const orderId = charge.metadata.orderId;
                const userId = charge.metadata.userId;

                if (charge.status === 'succeeded') {
                    await handleOrderUpdate(orderId, userId, 'success', charge.payment_intent);
                } else if (charge.status === 'failed') {
                    await handleOrderUpdate(orderId, userId, 'failed');
                }
                break;
            }
            default: {
                console.log(`Unhandled event type: ${event.type}`);
                return res.status(400).send(`Unhandled event type: ${event.type}`);
            }
        }

        res.status(200).json({ success: true, message: 'Webhook handled successfully.' });

    } catch (err) {
        console.error('Error handling the webhook:', err);
        return res.status(500).send(`Webhook handling error: ${err.message}`);
    }
};

// Function to handle order updates based on event type
const handleOrderUpdate = async (orderId, userId, status, payment_intent = null) => {
    console.log(orderId, userId, status, payment_intent);

    // Retrieve the order from the database
    const order = await OrderDb.findById(orderId);
    if (!order) {
        console.log('Order not found.');
        return;
    }

    // Update order status
    order.payment_intent = payment_intent;
    order.paymentStatus = status === 'success' ? 'success' : 'failed';
    order.status = status === 'success' ? 'Ordered' : 'Failed';
    order.completed = true;
    await order.save();

    console.log(`Order ID: ${orderId} updated with status: ${status}`);

    // Clear user's cart if payment was successful
    if (status === 'success') {
        await cartDb.updateOne(
            { userId: userId }, 
            { $set: { cartItems: [] } }
        );
        console.log(`Cart cleared for User ID: ${userId}`);
    }
};

// exports.webhook = async (req, res) => {
//     const sig = req.headers['stripe-signature'];
//     const payload = JSON.stringify(req.body, null, 2);
//     console.log(req.body);
    
//     const header = stripe.webhooks.generateTestHeaderString({
//         payload: payload,
//         secret: process.env.STRIPE_WEBHOOK_SECRET,
//     });
    
//     try {
//         // Construct the Stripe event from the raw webhook body and signature
//         const event = stripe.webhooks.constructEvent(payload, header, process.env.STRIPE_WEBHOOK_SECRET);
        
//         console.log(event.type);
        
//         // Handle different event types
//         switch (event.type) {
//             case 'payment_intent.succeeded': {
//                 const paymentIntent = event.data.object;
//                 console.log('Payment Intent succeeded:', paymentIntent);
                
//                 const orderId = paymentIntent.metadata.orderId;
//                 const userId = paymentIntent.metadata.userId;

//                 // Find or create the order
//                 await handleOrderUpdate(orderId, userId, 'success');
//                 break;
//             }
//             case 'charge.updated': {
//                 const charge = event.data.object;
//                 console.log('Charge updated:', charge);

//                 const orderId = charge.metadata.orderId;
//                 const userId = charge.metadata.userId;

//                 // You can check the charge status here and handle accordingly
//                 if (charge.status === 'succeeded') {
//                     // Update order status if the charge succeeded
//                     await handleOrderUpdate(orderId, userId, 'success',charge.payment_intent);
//                 } else if (charge.status === 'failed') {
//                     // Handle the failed charge scenario if necessary
//                     await handleOrderUpdate(orderId, userId, 'failed');
//                 }
//                 break;
//             }
//             default: {
//                 console.log(`Unhandled event type: ${event.type}`);
//                 return res.status(400).send(`Unhandled event type: ${event.type}`);
//             }
//         }

//         res.status(200).json({ success: true, message: 'Webhook handled successfully.' });
        
//     } catch (err) {
//         console.error('Error processing webhook:', err);
//         return res.status(400).send(`Webhook Error: ${err.message}`);
//     }
// };

// // Function to handle order updates based on event type
// const handleOrderUpdate = async (orderId, userId, status, payment_intent) => {
//     // Retrieve the order from the database using the orderId
//     console.log(orderId,userId,status,payment_intent);
    
//     const order = await OrderDb.findById(orderId);

//     if (!order) {
//         console.log('Order not found.');
//         return; // Or handle as needed
//     }

//     // Update order status based on the webhook event
//     order.payment_intent = payment_intent
//     order.paymentStatus = status === 'success' ? 'success' : 'failed';
//     order.status = status === 'success' ? 'Ordered' : 'Failed';
//     order.completed = true; 
//     await order.save();

//     console.log(`Order ID: ${orderId} updated with status: ${status}`);

//     // Clear user's cart if the payment is successful
//     if (status === 'success') {
//         await cartDb.updateOne(
//             { userId: userId }, 
//             { $set: { cartItems: [] } }
//         );
//         console.log(`Cart cleared for User ID: ${userId}`);
//     }
// };


// exports.webhook = async (req, res) => {
//     const sig = req.headers['stripe-signature'];
//     const payload = req.rawBody;
//     try {
//         const event = stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET);

//         // Handle the event type
//         if (event.type === 'payment_intent.succeeded') {
//             const paymentIntent = event.data.object;
//             console.log('-------------------------------------------->', paymentIntent);

//             const orderId = paymentIntent.metadata.orderId;
//             const userId = paymentIntent.metadata.userId;

//             // Retrieve the order from the database using the orderId
//             const order = await OrderDb.findById(orderId);

//             if (!order) {
//                 console.log('Order not found.');
//                 return res.status(404).json({ success: false, error: 'Order not found.' });
//             }

//             // Update order status
//             order.paymentStatus = 'success';
//             order.status = 'Ordered';
//             order.completed = true;
//             await order.save();

//             // Clear user's cart
//             await cartDb.updateOne(
//                 { userId: userId }, 
//                 { $set: { cartItems: [] } }
//             );

//             console.log(`Payment successful for Order ID: ${orderId} and cart cleared for User ID: ${userId}`);
            
//             res.status(200).json({ success: true, message: 'Payment successful and order updated.' });
//         } else {
//             console.log(`Unhandled event type: ${event.type}`);
//             res.status(400).send(`Unhandled event type: ${event.type}`);
//         }
//     } catch (err) {
//         console.error('Error processing webhook:', err);
//         return res.status(400).send(`Webhook Error: ${err.message}`);
//     }
// };



// exports.webhook = async (req, res) => {
//     const sig = req.headers['stripe-signature'];
//     const payload = JSON.stringify(req.body,null,2);
//     console.log(req.body);
//     const header = stripe.webhooks.generateTestHeaderString({
//         payload:payload,
//         secret:process.env.STRIPE_WEBHOOK_SECRET,
//     });
    
//     try {
//         // Construct the Stripe event from the raw webhook body and signature
//         const event = stripe.webhooks.constructEvent(payload, header, process.env.STRIPE_WEBHOOK_SECRET);

//         console.log(event.type);
        
//         // Handle the event type
//         if (event.type === 'payment_intent.succeeded') {
//             const paymentIntent = event.data.object;
//             console.log('-------------------------------------------->',paymentIntent);
            
//             // Assuming the order ID is stored in metadata of the paymentIntent
//             const orderId = paymentIntent.metadata.orderId;
//             const userId = paymentIntent.metadata.userId;

//             // Retrieve the order from the database using the orderId
//             const order = await OrderDb.findById(orderId);

//             if (!order) {
//                 console.log('Order not found.');
//                 return res.status(404).json({ success: false, error: 'Order not found.' });
//             }

//             // Update order status
//             order.paymentStatus = 'success';
//             order.status = 'Ordered';
//             order.completed = true;
//             await order.save();

//             // Clear user's cart
//             await cartDb.updateOne(
//                 { userId: userId }, 
//                 { $set: { cartItems: [] } }
//             );

//             console.log(`Payment successful for Order ID: ${orderId} and cart cleared for User ID: ${userId}`);
            
//             res.status(200).json({ success: true, message: 'Payment successful and order updated.' });
//         } else {
//             console.log(`Unhandled event type: ${event.type}`);
//             res.status(400).send(`Unhandled event type: ${event.type}`);
//         }

//     } catch (err) {
//         console.error('Error processing webhook:', err);
//         return res.status(400).send(`Webhook Error: ${err.message}`);
//     }
// };


// exports.webhook = async (req, res) => {
//     const sig = req.headers['stripe-signature'];
//     const payload = req.body; 
//     // console.log(payload);
    
//     // console.log('Received webhook:', payload.data.object.billing_details);
//     // console.log('Received webhook:', payload.data.object.outcome);
//     // console.log('Received webhook:', payload.data.object.payment_method_details);
//     try {
//         // Construct the Stripe event from the webhook body and signature
//         const event = stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET);

//         // Handle the event type
//         if (event.type === 'payment_intent.succeeded') {
//             const paymentIntent = event.data.object;
            
//             // Assuming the order ID is stored in metadata of the paymentIntent
//             const orderId = paymentIntent.metadata.orderId;
//             const userId = paymentIntent.metadata.userId;

//             // Retrieve the order from the database using the orderId
//             const order = await OrderDb.findById(orderId);

//             if (!order) {
//                 console.log('Order not found.');
//                 return res.status(404).json({ success: false, error: 'Order not found.' });
//             }

//             // Update order status
//             order.paymentStatus = 'success';
//             order.status = 'Ordered';
//             order.completed = true;
//             await order.save();

//             // Clear user's cart
//             await cartDb.updateOne(
//                 { userId: userId }, 
//                 { $set: { cartItems: [] } }
//             );

//             console.log(`Payment successful for Order ID: ${orderId} and cart cleared for User ID: ${userId}`);
            
//             res.status(200).json({ success: true, message: 'Payment successful and order updated.' });
//         } else {
//             console.log(`Unhandled event type: ${event.type}`);
//             res.status(400).send(`Unhandled event type: ${event.type}`);
//         }

//     } catch (err) {
//         console.error('Error processing webhook:', err);
//         return res.status(400).send(`Webhook Error: ${err.message}`);
//     }
//     // const sig = req.headers['stripe-signature'];
//     // let event;    
//     // console.log('a--->',process.env.STRIPE_WEBHOOK_SECRET);

//     // try {
//     //     event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
//     // } catch (err) {
//     //     console.error('Error processing webhook:', err);
//     //     return res.status(400).send(`Webhook Error: ${err.message}`);
//     // }

//     // switch (event.type) {
//     //     case 'payment_intent.succeeded':
//     //         const paymentIntent = event.data.object;
//     //         // console.log(paymentIntent);
//     //         // Fulfill the order based on the payment intent
//     //         const order = await OrderDb.findOne({ stripeSessionId: paymentIntent.id });
//     //         if (order) {
//     //             console.log('change to success');
                
//     //             order.paymentStatus = 'success';
//     //             order.status = 'Ordered';
//     //             order.completed = true;
//     //             await order.save();
//     //             // Optionally clear the cart for the user
//     //             await cartDb.updateOne(
//     //                 { userId: order.user }, 
//     //                 { $set: { cartItems: [] } }
//     //             );
//     //         }
//     //         break;

//     //     case 'payment_intent.payment_failed':
//     //         const paymentFailedIntent = event.data.object;
//     //         // Notify the customer that their payment has failed
//     //         // Implement any necessary action here
//     //         break;

//     //     // Handle other event types as needed
//     //     default:
//     //         console.log(`Unhandled event type ${event.type}`);
//     // }

//     // res.status(200).end();
// }
