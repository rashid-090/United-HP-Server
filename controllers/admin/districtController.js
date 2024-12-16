const District = require("../../model/districtModel");
const mongoose = require("mongoose");


// Getting all Districts to list on admin dashboard
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

// Creating new District if needed for admin
const createDistrict = async (req, res) => {
    try {
        let formData = req.body;


        const district = await District.create(formData);

        res.status(200).json({ district });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Updating the district
const updateDistrict = async (req, res) => {
    try {
        const { id } = req.params;
        let formData = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw Error("Invalid ID!!!");
        }





        const district = await District.findOneAndUpdate(
            { _id: id },
            { $set: { ...formData } },
            { new: true }
        );

        if (!district) {
            throw Error("No such District   ");
        }

        res.status(200).json({ district });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Deleting the district

const deleteDistrict = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw Error("Invalid ID!!!");
        }

        const district = await District.findOneAndDelete({ _id: id });

        if (!district) {
            throw Error("No Such District");
        }

        res.status(200).json({ district });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    createDistrict,
    getDistricts,
    updateDistrict,
    deleteDistrict
}