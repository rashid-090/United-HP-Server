const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    imageURL: {
        type: String,
        trim: true
    },
    parentCategory: {
        type: String,
        required: true,
    },
    subCategory: {
        type: String,
        required: true,
    },
    parentCategoryName: {
        type: String,
    },
    subCategoryName: {
        type: String,
    },
}, {
    timestamps: true
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;