const Product = require("../../model/productModel");
exports.getProducts = async (req, res, next) => {
    try {
        const { slug } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        // Build query object
        const query = {};
        if (slug) {
            query.parentCategory = slug;
        }

        const total = await Product.countDocuments(query);
        const products = await Product.find(query)
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            success: true,
            total,
            page,
            pages: Math.ceil(total / limit),
            products
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};