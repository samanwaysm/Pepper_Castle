const bodyParser = require('body-parser');

// Middleware to capture the raw body for Stripe signature verification
const stripeRawBody = (req, res, buf, encoding) => {
    if (req.headers['stripe-signature']) {     
        req.body = buf.toString(encoding || 'utf8'); // Store the raw body
    }
};

// Create a JSON parser that uses the custom raw body function
const jsonParser = bodyParser.json({ verify: stripeRawBody });

// Create a raw body parser for the Stripe webhook
const rawBodyParser = bodyParser.raw({ type: 'application/json' });

module.exports = {
    jsonParser,
    rawBodyParser,
};
