// controllers/productController.js

const Product = require("../../model/productModel");


// Create new product => /api/v1/admin/product/new
exports.newProduct = async (req, res, next) => {
    const { name, type } = req.body;
    const files = req?.files;

    let imageURL = "";
    console.log(files);
    if (files && files.length > 0) {
        imageURL = files[0].path; // Assuming the first file is the product image
    }


    const product = await Product.create({
        name,
        type,
        imageURL
    });

    res.status(201).json({
        success: true,
        product
    });
};

// Get all products => /api/v1/products
exports.getProducts = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const skip = (page - 1) * limit;

        const total = await Product.countDocuments();
        const products = await Product.find().skip(skip).limit(limit);

        res.status(200).json({
            success: true,
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
            products
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
// Get single product details => /api/v1/product/:id
exports.getSingleProduct = async (req, res, next) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return res.status(404).json({
            success: false,
            message: 'Product not found'
        });
    }

    res.status(200).json({
        success: true,
        product
    });
};

// Update Product => /api/v1/admin/product/:id
exports.updateProduct = async (req, res, next) => {
    let product = await Product.findById(req.params.id);
    const { name, type } = req.body;
    const files = req?.files;


    console.log(files);
    if (files && files.length > 0) {
        req.body.imageURL = files[0].path; // Assuming the first file is the product image
    }

    if (!product) {
        return res.status(404).json({
            success: false,
            message: 'Product not found'
        });
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });

    res.status(200).json({
        success: true,
        product
    });
};

// Delete Product => /api/v1/admin/product/:id
exports.deleteProduct = async (req, res, next) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return res.status(404).json({
            success: false,
            message: 'Product not found'
        });
    }

    await Product.deleteOne({ _id: req.params.id });

    res.status(200).json({
        success: true,
        message: 'Product is deleted'
    });
};