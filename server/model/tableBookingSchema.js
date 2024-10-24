const mongoose = require('mongoose');

var schema = new mongoose.Schema({
    name:{
        type: String,
        required:true
    },
    email:{
        type: String,
        required:true,
        required:true
    },
    phone:{
        type: String,
        required:true
    },
    message:{
        type: String,
        required:true
    },
    status:{
        type: String,
        default: 'booked'
    }
})

const tableBooking = mongoose.model('tablebooking', schema);

module.exports = tableBooking;