const mongoose = require("mongoose");
const bodyParser = require('body-parser');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);


const OrderDb = require("../../model/orderSchema");
const cartDb = require("../../model/cartSchema");


exports.webhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const payload = req.rawBody;
    try {
        const event = stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET);

        // Handle the event type
        if (event.type === 'payment_intent.succeeded') {
            const paymentIntent = event.data.object;
            console.log('-------------------------------------------->', paymentIntent);

            const orderId = paymentIntent.metadata.orderId;
            const userId = paymentIntent.metadata.userId;

            // Retrieve the order from the database using the orderId
            const order = await OrderDb.findById(orderId);

            if (!order) {
                console.log('Order not found.');
                return res.status(404).json({ success: false, error: 'Order not found.' });
            }

            // Update order status
            order.paymentStatus = 'success';
            order.status = 'Ordered';
            order.completed = true;
            await order.save();

            // Clear user's cart
            await cartDb.updateOne(
                { userId: userId }, 
                { $set: { cartItems: [] } }
            );

            console.log(`Payment successful for Order ID: ${orderId} and cart cleared for User ID: ${userId}`);
            
            res.status(200).json({ success: true, message: 'Payment successful and order updated.' });
        } else {
            console.log(`Unhandled event type: ${event.type}`);
            res.status(400).send(`Unhandled event type: ${event.type}`);
        }
    } catch (err) {
        console.error('Error processing webhook:', err);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
};



// exports.webhook = async (req, res) => {
//     const sig = req.headers['stripe-signature'];
//     const payload = req.body;
//     // console.log(req.body);
    
//     try {
//         // Construct the Stripe event from the raw webhook body and signature
//         const event = stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET);

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
