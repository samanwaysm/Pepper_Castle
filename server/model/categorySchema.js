const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    category:{  
        type:String,
        required:true,
        unique:true
      },
      status:{
        type:Boolean,
        default:true
      }
});

const Category = mongoose.model('category',schema);

module.exports = Category;