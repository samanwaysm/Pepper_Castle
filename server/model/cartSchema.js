const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    userId:{
        type:mongoose.SchemaTypes.ObjectId,
        ref:'user'
    },
    cartItems:[{
        itemId:{
            type:mongoose.SchemaTypes.ObjectId,
            ref:'item'
        },
        quantity:{
            type:Number,
            default:1
        }
    }]
})

const cartDb = mongoose.model('cartDb',schema);
module.exports = cartDb