
const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    key:{
        type:String
    },
    img:{
        type:String
    },
    name:{
        type:String
    },
    category:String,
    price:{
        type:Number
    },
    quantity:{
        type:Number,
        default:1
    }
});

const Cart = mongoose.model('Cart',cartSchema);

module.exports = Cart;