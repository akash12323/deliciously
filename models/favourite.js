
const mongoose = require('mongoose');

const favouriteSchema = new mongoose.Schema({
    key:{
        type:String
    },
    img:{
        type:String
    },
    name:{
        type:String
    },
    category:String
});

const Favourite = mongoose.model('Favourite',favouriteSchema);

module.exports = Favourite;