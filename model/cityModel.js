const mongoose = require("mongoose");
const District = require("./districtModel");

const { Schema } = mongoose;

const CitySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    district: {
      type: Schema.Types.ObjectId,
      ref: District,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const City = mongoose.model("City", CitySchema);

module.exports = City;
