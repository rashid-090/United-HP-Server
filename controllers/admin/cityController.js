const City = require("../../model/cityModel");
const mongoose = require("mongoose");

// Getting all Cities under a specific district to list on admin dashboard
const getCities = async (req, res) => {
    try {
        const { district } = req.body; // District ID from the request body
        const { status, search, page = 1, limit = 100 } = req.query;

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
        const cities = await City.find(filter)
            .populate("district") // Populate district details
            .skip(skip)


        // Count total cities matching the filters
        const totalAvailableCities = await City.countDocuments(filter);

        res.status(200).json({ cities, totalAvailableCities });
    } catch (error) {
        console.log(error);

        res.status(400).json({ error: error.message });
    }
};

// Creating a new City
const createCity = async (req, res) => {
    try {
        let formData = req.body;


        const city = await City.create(formData);

        res.status(200).json({ city });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Updating a City
const updateCity = async (req, res) => {
    try {
        const { id } = req.params;
        let formData = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw Error("Invalid ID!!!");
        }

        const city = await City.findOneAndUpdate(
            { _id: id },
            { $set: { ...formData } },
            { new: true }
        ).populate("district");

        if (!city) {
            throw Error("No such City");
        }

        res.status(200).json({ city });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Deleting a City
const deleteCity = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw Error("Invalid ID!!!");
        }

        const city = await City.findOneAndDelete({ _id: id });

        if (!city) {
            throw Error("No such City");
        }

        res.status(200).json({ city });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    createCity,
    getCities,
    updateCity,
    deleteCity,
};
