const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderId:{
        type: String, 
        required: true 
    },
    items: [{
        item: {
            type: String,
            required: true
        },
        quantity: { 
            type: Number, 
            required: true 
        },
        price: { 
            type: Number, 
            required: true 
        },
        image:[{
            type:String,
            required:true
        }]
    }],
    address: {
        username: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        street : {
            type: String,
            required: true
        },
        block: {
            type: String,
            required: true   
        },
        unitnum: {
            type: String,
            required: true
        },
        postal: {
            type: Number,
            required: true
        },
        structuredAddress: {
            type: String,
            required: true
        },
        latitude:{
            type: String,
            required: true
        }, 
        longitude:{
            type: String,
            required: true
        },
        distanceInKilometers:{
            type: String,
            required: true
        }
    },
    paymentMethod: { 
        type: String, 
        required: true 
    },
    totalAmount: { 
        type: Number, 
        required: true 
    },
    paymentStatus: { 
        type: String, 
        default: 'pending' 

    },
    stripeSessionId: {
        type: String, 
        default: null 
    },
    status: { 
        type: String, 
        default: null
    },
    completed: { 
        type: Boolean, 
        default: false
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('Order', orderSchema);
