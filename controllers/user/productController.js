const Product = require("../../model/productModel");
exports.getProducts = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const total = await Product.countDocuments();
        const products = await Product.find().skip(skip).limit(limit);

        res.status(200).json({
            success: true,
            total,
            products
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};