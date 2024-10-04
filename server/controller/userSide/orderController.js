
const OrderDb = require("../../model/orderSchema");
const cartDb = require("../../model/cartSchema");

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);


exports.createOrder = async (req, res) => {
  try {
      const { orderItems, paymentMethod, address, userId } = req.body;

      if (!userId || !orderItems || !paymentMethod || !address) {
          return res.status(400).json({ success: false, error: 'Missing required fields.' });
      }

      let parsedOrderItems = orderItems;
      if (typeof orderItems === 'string') {
          try {
              parsedOrderItems = JSON.parse(orderItems);
          } catch (error) {
              return res.status(400).json({ success: false, error: 'Invalid orderItems format.' });
          }
      }

      console.log(parsedOrderItems);

      if (!Array.isArray(parsedOrderItems) || parsedOrderItems.length === 0) {
          return res.status(400).json({ success: false, error: 'orderItems should be a non-empty array.' });
      }

      const { username, phone, street, block, unitnum, postal, structuredAddress } = address;
      if (!structuredAddress || !postal || !unitnum || !block || !street || !phone || !username) {
          return res.status(400).json({ success: false, error: 'Incomplete address information.' });
      }

      let totalAmount = 0;
      const items = parsedOrderItems.map(item => {
          const { itemDetails, cartItems } = item;
          const { price, item: itemName } = itemDetails;
          const { quantity } = cartItems;

          totalAmount += price * quantity;

          return {
              item: itemName,
              quantity,
              price
          };
      });

      const newOrder = new OrderDb({
          user: userId,
          items,
          paymentMethod,
          address: {
              username,
              phone,
              street,
              block,
              unitnum,
              postal,
              structuredAddress
          },
          totalAmount,
          paymentStatus: 'pending' 
      });

      const savedOrder = await newOrder.save();

      if (paymentMethod === 'online') {
          const session = await stripe.checkout.sessions.create({
              line_items: parsedOrderItems.map(item => ({
                  price_data: {
                      currency: 'sgd',
                      product_data: {
                          name: item.itemDetails.item,
                      },
                      unit_amount: item.itemDetails.price * 100
                  },
                  quantity: item.cartItems.quantity
              })),
              mode: 'payment',
              success_url: `https://example.com/success?orderId=${savedOrder._id}`,
              cancel_url: `https://example.com/cancel?orderId=${savedOrder._id}`
          });

          console.log(session);

          savedOrder.paymentStatus = 'success'
          savedOrder.stripeSessionId = session.id;
          await savedOrder.save();

          // Remove items from the user's cart
          await cartDb.updateOne(
            { userId }, 
            { $set: { cartItems: [] } }
        );        

          return res.json({ success: true, paymentUrl: session.url, sessionId: session.id });
      } else {
            // Remove items from the user's cart
            await cartDb.updateOne(
                { userId }, 
                { $set: { cartItems: [] } }
            );            
            return res.json({ success: true, message: 'Order placed successfully with cash on delivery.' });
      }

  } catch (error) {
      console.error('Order creation failed:', error);
      return res.status(500).json({ success: false, error: 'Order creation failed.' });
  }
};

// exports.getSessionAndPaymentIntent = async (req, res) => {
//   const { sessionId } = req.params;

//   try {
//       // Retrieve Stripe session
//       const session = await stripe.checkout.sessions.retrieve(sessionId);

//       if (!session) {
//           return res.status(404).json({ success: false, error: 'Session not found.' });
//       }

//       // Retrieve payment intent if available
//       if (session.payment_intent) {
//           const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent);
//           console.log(session, paymentIntent);
          
//           return res.send({ success: true, session, paymentIntent });
//       } else {
//           return res.json({ success: true, session, message: 'No payment intent found for this session.' });
//       }
//   } catch (error) {
//       console.error('Failed to retrieve session or payment intent:', error);
//       return res.status(500).json({ success: false, error: 'Failed to retrieve session or payment intent.' });
//   }
// };
