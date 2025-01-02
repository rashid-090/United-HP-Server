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

        const skip = (page - 1) * limit;


        // Query the dealers with the filter
        const dealers = await User.find(
            { role: "user", ...filter, isActive: true },
            {
                password: 0,
                dateOfBirth: 0,
                role: 0,
                isEmailVerified: 0,
            }
        ).populate("district city")
            .skip(skip).limit(limit)
            .sort({ createdAt: -1 });




        if (dealers.length === 0) {
            throw new Error("No dealers found");
        }

        const totalAvailableDealers = await User.countDocuments({ role: "user", ...filter, isActive: true });

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

        const districts = await District.find(filter).skip(skip).limit(limit).sort({ name: 1 });

        const totalAvailableDistricts = await District.countDocuments(filter);

        res.status(200).json({ districts, totalAvailableDistricts });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


const getStore = async (req, res) => {

    try {

        const { id } = req.params
        const store = await User.findOne(
            { role: "user", _id: id },
            {
                password: 0,
            }
        )
        res.status(200).json({ store });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

const haversineDistance = (coords1, coords2) => {
    const toRadians = (deg) => (deg * Math.PI) / 180;


    if (!coords2) {
        return
    }


    const [lat1, lon1] = coords1;
    const [lat2, lon2] = coords2;

    const R = 6371; // Radius of the Earth in kilometers
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
};

const findNearbyStores = async (latitude, longitude, maxDistance) => {
    const allStores = await User.find({ role: 'user', isActive: true });

    const nearbyStores = allStores.filter((store) => {
        const distance = haversineDistance(
            [latitude, longitude],
            store.location.coordinates
        );
        return distance <= maxDistance;
    });

    return nearbyStores;
};


const nearByDealers = async (req, res) => {
    try {
        const { latitude, longitude, page = 1, limit = 6 } = req.query;
        const maxDistance = 5; // 5 km radius

        // Parse page and limit to ensure they're integers
        const pageNumber = Math.max(1, parseInt(page, 10));
        const limitNumber = Math.max(1, parseInt(limit, 10));
        const skip = (pageNumber - 1) * limitNumber;

        // Fetch all nearby stores
        const allStores = await findNearbyStores(
            parseFloat(latitude),
            parseFloat(longitude),
            maxDistance
        );

        // Apply pagination
        const paginatedStores = allStores.slice(skip, skip + limitNumber);

        res.status(200).json({
            totalStores: allStores.length,
            totalPages: Math.ceil(allStores.length / limitNumber),
            currentPage: pageNumber,
            stores: paginatedStores,
        });
    } catch (error) {
        console.error('Error fetching nearby stores:', error);
        res.status(500).json({ error: 'An error occurred' });
    }
}





module.exports = {
    getDealers,
    getCities,
    getDistricts,
    getStore,
    nearByDealers
}
