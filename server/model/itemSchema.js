const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    item:{
        type:String,
        required:true
    },
    category:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    image:[{
        type:String,
        required:true
    }],
    listed:{
        type:Boolean,
        default:true
    },
    isCategory:{
        type:Boolean,
        default:true
    }
});

const Product = mongoose.model('Item',schema)

module.exports = Product