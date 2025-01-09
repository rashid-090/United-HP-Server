const { default: mongoose } = require("mongoose");
const Enquiry = require("../../model/EnquiryModel"); // Adjust the path to your model

// Controller function to handle POST request
const getEnquiriesById = async (req, res) => {
    try {


        // Log the user's ID
        const userId = req.params.id;
        const {
            status,
            search,
            page = 1,
            limit = 10,
            startingDate,
            endingDate,

        } = req.query;

        let filter = {};

        const skip = (page - 1) * limit;

        if (startingDate) {
            const date = new Date(startingDate);
            filter.createdAt = { $gte: date };
        }
        if (endingDate) {
            const date = new Date(endingDate);
            filter.createdAt = { ...filter.createdAt, $lte: date };
        }
        

        if (search) {
            const searchRegex = search
                .split(" ")
                .map((word) => `(?=.*${word})`) // Match all words
                .join(""); // Combine into a single regex
            filter.$or = [
                { name: { $regex: searchRegex, $options: "i" } },
                { mobile: { $regex: searchRegex, $options: "i" } },
                { pincode: { $regex: searchRegex, $options: "i" } },
            ];
        }

        // Fetch enquiries associated with the user
        const enquiries = await Enquiry.find({ dealerId: userId,...filter })
            .populate("dealerId", "name")
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });;

        const totalAvailableEnquiries = await Enquiry.countDocuments({
            dealerId: userId,
            ...filter
        })

        // Return the enquiries as a response
        return res.status(200).json({ success: true, enquiries, totalAvailableEnquiries });
    } catch (error) {
        console.error("Error fetching enquiries:", error);
        return res.status(500).json({ message: "Internal server error", error });
    }
};


// Controller function to handle PATCH request
const updateEnquiry = async (req, res) => {

    const { id } = req.params; // Enquiry ID
    const { followUps, priceRange } = req.body; // Updated follow-ups and price range from the client


    try {
        // Find the enquiry by ID
        const enquiry = await Enquiry.findById(id);

        if (!enquiry) {
            return res.status(404).json({ message: "Enquiry not found" });
        }

        // Loop through the incoming followUps and update or keep existing dates
        const updatedFollowUps = followUps.map((newFollowUp) => {
            // Find the existing follow-up with the same index or identifier
            const existingFollowUp = enquiry.followUps.find(
                (followUp) =>
                    followUp._id && followUp._id.toString() === newFollowUp._id
            );

            // Update the date only if there's a change
            if (existingFollowUp) {
                return {
                    ...existingFollowUp.toObject(),
                    quality: newFollowUp.quality,
                    note: newFollowUp.note,
                    date:
                        existingFollowUp.quality !== newFollowUp.quality ||
                            existingFollowUp.note !== newFollowUp.note
                            ? new Date() // Update date if quality or note has changed
                            : existingFollowUp.date, // Retain original date
                };
            }

            // If no match, add a new follow-up with the current date
            return { ...newFollowUp, date: new Date() };
        });

        // Update the followUps and priceRange fields in the database
        enquiry.followUps = updatedFollowUps;

        // Update the priceRange if it exists in the request body
        if (priceRange) {
            enquiry.priceRange = priceRange;
        }

        await enquiry.save();

        res.status(200).json({ message: "Enquiry updated successfully", enquiry });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred", error: error.message });
    }
};

// Controller function to handle POST request for pending enquiries
const getPendingEnquiriesById = async (req, res) => {
    try {
        // Log the user's ID
        const userId = req.user._id;
        const {
            status,
            search,
            page = 1,
            limit = 10,
            startingDate,
            endingDate,

        } = req.query;

        let filter = {};

        const skip = (page - 1) * limit;

        // Fetch pending enquiries associated with the user (empty followUp array)
        const pendingEnquiries = await Enquiry.find({
            dealerId: userId,
            $or: [
                { followUps: { $exists: false } },  // No followUp field
                { followUps: { $size: 0 } }         // followUp is an empty array
            ]
        })
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });;;

        const totalAvailablePendingEnquiries = await Enquiry.countDocuments({
            dealerId: userId,
            $or: [
                { followUps: { $exists: false } },  // No followUp field
                { followUps: { $size: 0 } }         // followUp is an empty array
            ],
            ...filter
        })

        // Return the pending enquiries as a response
        return res.status(200).json({ success: true, pendingEnquiries, totalAvailablePendingEnquiries });
    } catch (error) {
        console.error("Error fetching pending enquiries:", error);
        return res.status(500).json({ message: "Internal server error", error });
    }
};

const getEnquiryById = async (req, res) => {
    try {
        // Extract the ID from the request parameters
        const enquiryId = req.params.id;

        // Check if the enquiry ID is provided
        if (!enquiryId) {
            return res.status(400).json({ message: "Enquiry ID is required" });
        }

        // Validate the ID format using Mongoose's ObjectId validation
        if (!mongoose.Types.ObjectId.isValid(enquiryId)) {
            return res.status(400).json({ message: "Invalid Enquiry ID format" });
        }

        // Fetch the enquiry from the database
        const enquiry = await Enquiry.findById(enquiryId).populate('dealerId', "name");

        // If the enquiry is not found, return a 404 error
        if (!enquiry) {
            return res.status(404).json({ message: "Enquiry not found" });
        }

        // Return the enquiry as a response
        return res.status(200).json({ success: true, enquiry });
    } catch (error) {
        console.error("Error fetching enquiry:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};


const getAllPendingEnquiries = async (req, res) => {
    try {
        const {
            search,
            page = 1,
            limit = 10,
            startingDate,
            endingDate
        } = req.query;

        const skip = (page - 1) * limit;

        let filter = {};

        if (search) {
            const searchRegex = search
                .split(" ")
                .map((word) => `(?=.*${word})`) // Match all words
                .join(""); // Combine into a single regex
            filter.$or = [
                { name: { $regex: searchRegex, $options: "i" } },
                { mobile: { $regex: searchRegex, $options: "i" } },
                { pincode: { $regex: searchRegex, $options: "i" } },
            ];
        }

        if (startingDate) {
            const date = new Date(startingDate);
            filter.createdAt = { $gte: date };
        }
        if (endingDate) {
            const date = new Date(endingDate);
            filter.createdAt = { ...filter.createdAt, $lte: date };
        }

        // Combine the `followUps` condition and search filter using `$and`
        const query = {
            $and: [
                {
                    $or: [
                        { followUps: { $exists: false } },  // No followUps field
                        { followUps: { $size: 0 } },       // followUps is an empty array
                    ],
                },
                filter, // Add the search filter here
            ],
        };

        const pendingEnquiries = await Enquiry.find(query)
            .populate("dealerId", "name") // Populate only the `name` field
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const totalAvailablePendingEnquiries = await Enquiry.countDocuments(query);

        return res.status(200).json({
            success: true,
            pendingEnquiries,
            totalAvailablePendingEnquiries,
        });
    } catch (error) {
        console.error("Error fetching pending enquiries:", error);
        return res.status(500).json({ message: "Internal server error", error });
    }
};





module.exports = { getEnquiriesById, updateEnquiry, getPendingEnquiriesById, getEnquiryById, getAllPendingEnquiries };
