const City = require("../../model/cityModel");
const District = require("../../model/districtModel");
const State = require("../../model/stateModel");
const mongoose = require("mongoose");


// Getting all States to list on admin dashboard
const getStates = async (req, res) => {
    try {
        const { status, search, page = 1, limit = 100, state, city } = req.query;

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

        const states = await State.find(filter).skip(skip).sort({ name: 1 });

        const totalAvailableStates = await State.countDocuments(filter);

        res.status(200).json({ states, totalAvailableStates });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Creating new State if needed for admin
const createState = async (req, res) => {
    try {
        let formData = req.body;


        const state = await State.create(formData);

        res.status(200).json({ state });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Updating the state
const updateState = async (req, res) => {
    try {
        const { id } = req.params;
        let formData = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw Error("Invalid ID!!!");
        }





        const state = await State.findOneAndUpdate(
            { _id: id },
            { $set: { ...formData } },
            { new: true }
        );

        if (!state) {
            throw Error("No such State   ");
        }

        res.status(200).json({ state });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Deleting the state

const deleteState = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw Error("Invalid ID!!!");
        }

        // First, find all districts under the state
        const districts = await District.find({ state: id });

        // Extract district IDs
        const districtIds = districts.map((district) => district._id);

        // Delete all cities under this state or under its districts
        await City.deleteMany({
            $or: [
                { state: id },
                { district: { $in: districtIds } },
            ],
        });

        // Delete all districts under this state
        await District.deleteMany({ state: id });

        // Delete the state
        const state = await State.findOneAndDelete({ _id: id });

        if (!state) {
            throw Error("No Such State");
        }

        res.status(200).json({ message: "State, Districts, and Cities deleted successfully", state });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    createState,
    getStates,
    updateState,
    deleteState
}