const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    userId: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true
    },
    address: [
        {
            fullName: {
                type: String,
                required: true
            },
            phoneNum: {
                type: String,
                required: true
            },
            street : {
                type: String,
                required: true
            },
            apartment: {
                type: String,
                required: true   
            },
            unitNum: {
                type: String,
                required: true
            },
            postalCode: {
                type: Number,
                required: true
            },
            structuredAddress: {
                type: String,
                required: true
            } 
        }
    ],
    defaultAddress: {
        type: mongoose.SchemaTypes.ObjectId
    }
});

const addressDb = mongoose.model('AddressDb', schema);

module.exports = addressDb;
