const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        required: true,
        trim: true
    },
    imageURL: {
        type: String,
        trim: true
    }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;