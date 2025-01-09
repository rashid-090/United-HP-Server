const Enquiry = require("../../model/EnquiryModel"); // Adjust the path to your model

// Controller function to handle POST request
const createEnquiry = async (req, res) => {
    try {
        const { name, mobile, pincode, dealerId } = req.body;
        if (!dealerId) {
            throw new Error("DealerId is not avalable.")
        }


        // Validate required fields
        if (!name || !mobile) {
            return res.status(400).json({ message: "Name, and mobile are required" });
        }

        // Create a new enquiry
        const newEnquiry = new Enquiry({
            name,
            mobile,
            pincode,
            dealerId
        });

        // Save the enquiry to the database
        const savedEnquiry = await newEnquiry.save();

        return res.status(201).json({
            message: "Enquiry created successfully",
            enquiry: savedEnquiry,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error", error });
    }
};

module.exports = { createEnquiry };
