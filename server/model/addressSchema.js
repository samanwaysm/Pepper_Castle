const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    userId: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true
    },
    address: [
        {
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
            } 
        }
    ],
    defaultAddress: {
        type: mongoose.SchemaTypes.ObjectId
    }
});

const addressDb = mongoose.model('AddressDb', schema);

module.exports = addressDb;
