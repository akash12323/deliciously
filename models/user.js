const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Favourite = require('./favourite');
const Cart = require('./cart');
const Order = require('./order');


const userSchema = new mongoose.Schema({
    email:{
        type:String,
        unique:true,
        required:true
    },
    phoneNumber:{
        type:String
    },
    address:{
        type:String
    },
    favourites:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Favourite'
    }],
    cart:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Cart'
    }],
    orders:[{
            type: mongoose.Schema.Types.ObjectId,
            ref:'Order'
    }]
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model('User',userSchema);

module.exports = User;