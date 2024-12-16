const District = require("../../model/districtModel");
const mongoose = require("mongoose");
const User = require("../../model/userModel");
const City = require("../../model/cityModel");

const getDealers = async (req, res) => {
    try {
        const { district, city, page = 1, limit = 6,
        } = req.query;


        let filter = {};

        // Convert district and city to ObjectId if they are provided
        if (district) {
            filter.district = new mongoose.Types.ObjectId(district);
        }

        if (city) {
            filter.city = new mongoose.Types.ObjectId(city);
        }
        console.log(filter);

        const skip = (page - 1) * limit;


        // Query the dealers with the filter
        const dealers = await User.find(
            { role: "admin", ...filter, isActive: true },
            {
                password: 0,
                dateOfBirth: 0,
                role: 0,
                walletBalance: 0,
                isEmailVerified: 0,
            }
        ).populate("district city")
            .skip(skip).limit(limit)
            .sort({ createdAt: -1 });



        if (dealers.length === 0) {
            throw new Error("No dealers found");
        }

        const totalAvailableDealers = await User.countDocuments({ role: "admin", ...filter, isActive: true });

        res.status(200).json({ dealers, totalAvailableDealers });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


const getCities = async (req, res) => {
    try {
        const { district } = req.body; // District ID from the request body
        const { status, search, page = 1, limit = 10 } = req.query;

        let filter = {};

        // Filter by district ID
        if (district) {
            filter.district = district;
        }
        // Filter by active/inactive status
        if (status) {
            filter.isActive = status === "active";
        }

        // Filter by search query (case-insensitive)
        if (search) {
            filter.name = { $regex: new RegExp(search, "i") };
        }

        const skip = (page - 1) * limit;

        // Fetch cities based on filters with pagination
        const cities = await City.find()
            .populate("district") // Populate district details
            .skip(skip)
            .limit(limit);

        // Count total cities matching the filters
        const totalAvailableCities = await City.countDocuments(filter);

        res.status(200).json({ cities, totalAvailableCities });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getDistricts = async (req, res) => {
    try {
        const { status, search, page = 1, limit = 10, district, city } = req.query;

        let filter = {};

        if (status) {
            if (status === "active") {
                filter.isActive = true;
            } else {
                filter.isActive = false;
            }
        }

        if (search) {
            filter.name = { $regex: new RegExp(search, "i") };
        }

        const skip = (page - 1) * limit;

        const districts = await District.find(filter).skip(skip).limit(limit);

        const totalAvailableDistricts = await District.countDocuments(filter);

        res.status(200).json({ districts, totalAvailableDistricts });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


const getStore = async (req, res) => {

    try {

        const { id } = req.params
        console.log(id);
        const store = await User.findOne(
            { role: "admin", _id: id },
            {
                password: 0,
            }
        )
        res.status(200).json({ store });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}




module.exports = {
    getDealers,
    getCities,
    getDistricts,
    getStore
}
