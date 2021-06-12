const mongoose = require('mongoose');
const Cart = require('./cart');

const orderSchema = new mongoose.Schema({
    txnid: {
        type: String,
        required: true,
        unique:true
    },
    amount: {
        type: String,
        required:true
    },
    date: {
        type: Date,
        default:Date.now
    },
    orderid:{
        type:String,
        unique:true
    },
    orderedProducts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:'Cart'
        }
    ]
})

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;