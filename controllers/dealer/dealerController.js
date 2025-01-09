const { default: mongoose } = require("mongoose");
const Enquiry = require("../../model/EnquiryModel"); // Adjust the path to your model

const getEnquiries = async (req, res) => {
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
        const enquiries = await Enquiry.find({ dealerId: userId ,...filter})
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


const updateEnquiry = async (req, res) => {
    const { id } = req.params; // Enquiry ID
    const { followUps, priceRange } = req.body; // Updated follow-ups and price range from the client

    try {
        // Find the enquiry by ID
        const enquiry = await Enquiry.findById(id);

        if (!enquiry) {
            return res.status(404).json({ message: "Enquiry not found" });
        }

        // Store existing follow-ups in an object for easy lookup
        const existingFollowUps = {};
        enquiry.followUps.forEach(followUp => {
            existingFollowUps[followUp.name] = followUp; // Use a unique field, e.g., `name`
        });

        // Now handle the new follow-ups, checking against existing ones
        const updatedFollowUps = [];

        followUps.forEach(newFollowUp => {
            if (existingFollowUps[newFollowUp.name]) {
                // If this follow-up already exists, we update quality and note, but retain the date
                updatedFollowUps.push({
                    ...existingFollowUps[newFollowUp.name].toObject(),
                    quality: newFollowUp.quality,
                    note: newFollowUp.note,
                    date: newFollowUp.date
                });
            } else {
                // If this is a new follow-up, we add it with the current date
                updatedFollowUps.push({
                    ...newFollowUp,
                    date: new Date() // Set the current date for new follow-ups
                });
            }
        });

        // Update the followUps and priceRange fields in the database
        enquiry.followUps = updatedFollowUps;

        // Update the priceRange if it exists in the request body
        if (priceRange) {
            enquiry.priceRange = priceRange;
        }

        // Save the updated enquiry
        await enquiry.save();

        res.status(200).json({ message: "Enquiry updated successfully", enquiry });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred", error: error.message });
    }
};





// Controller function to handle POST request for pending enquiries
const getPendingEnquiries = async (req, res) => {
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


        // Date
        if (startingDate) {
            const date = new Date(startingDate);
            filter.createdAt = { $gte: date };
        }
        if (endingDate) {
            const date = new Date(endingDate);
            filter.createdAt = { ...filter.createdAt, $lte: date };
        }
        // Search filter
        if (search) {
            // If search contains spaces, match all parts (e.g., "John Doe" should match "John" and "Doe")
            const searchRegex = search
                .split(" ")
                .map((word) => `(?=.*${word})`) // Create a regex to match each word
                .join(""); // Join with no space in between
            filter.$or = [
                { name: { $regex: searchRegex, $options: "i" } },
                { email: { $regex: searchRegex, $options: "i" } },
            ];
        }

        const skip = (page - 1) * limit;

        // Fetch pending enquiries associated with the user (empty followUp array)
        const pendingEnquiries = await Enquiry.find({
            dealerId: userId,
            $or: [
                { followUps: { $exists: false } },  // No followUp field
                { followUps: { $size: 0 } }         // followUp is an empty array
            ],
            ...filter
        })
            .populate("dealerId", "name")
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

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


const getEnquiry = async (req, res) => {
    try {
        const userId = req.user?._id;
        const enquiryId = req.params.id;

        // Check if the user is authenticated
        if (!userId) {
            return res.status(400).json({ message: "User not authenticated" });
        }

        // Check if enquiryId is valid
        if (!mongoose.Types.ObjectId.isValid(enquiryId)) {
            return res.status(400).json({ message: "Invalid Enquiry ID" });
        }

        // Fetch enquiry associated with the user
        const enquiry = await Enquiry.findOne({ dealerId: userId, _id: enquiryId });

        if (!enquiry) {
            return res.status(404).json({ message: "Enquiry not found" });
        }

        // Return the enquiry as a response
        return res.status(200).json({ success: true, enquiry });
    } catch (error) {
        console.error("Error fetching enquiry:", error.message);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

const getAllEnquiries = async (req, res) => {
    try {
        // Log the user's ID

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
        const enquiries = await Enquiry.find({ ...filter })
            .populate("dealerId", "name")
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });;

        const totalAvailableEnquiries = await Enquiry.countDocuments({
            ...filter
        })

        // Return the enquiries as a response
        return res.status(200).json({ success: true, enquiries, totalAvailableEnquiries });
    } catch (error) {
        console.error("Error fetching all enquiries:", error);
        return res.status(500).json({ message: "Internal server error", error });
    }
};





module.exports = { getEnquiries, updateEnquiry, getPendingEnquiries, getEnquiry, getAllEnquiries };
