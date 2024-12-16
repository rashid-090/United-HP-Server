const mongoose = require("mongoose");

const { Schema } = mongoose;

const DistrictSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const District = mongoose.model("District", DistrictSchema);

module.exports = District;
