const mongoose = require("mongoose");
const User = require("./userModel");

const { Schema } = mongoose;

// Define the FollowUp schema with a date field
const followUpSchema = new Schema({
  quality: {
    type: String,
    enum: ["High", "Medium", "Low"],
  },
  note: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now, // Default to the current date when the follow-up is created
  },
}, { _id: false }); // _id: false to avoid adding a new _id to each follow-up item

// Define the main Enquiry schema
const EnquirySchema = new Schema(
  {
    dealerId: {
      type: Schema.Types.ObjectId,
      ref: User
    },
    name: {
      type: String,
      required: true,
    },
    mobile: {
      type: String,
      required: true,
    },
    pincode: {
      type: String,
    },
    followUps: {
      type: [followUpSchema], // Array of follow-up documents
    },
    priceRange: {
      type: String,
    }

  },
  { timestamps: true }
);

const Enquiry = mongoose.model("Enquiry", EnquirySchema);

module.exports = Enquiry;
