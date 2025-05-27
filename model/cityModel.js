const mongoose = require("mongoose");
const District = require("./districtModel");
const State = require("./stateModel");

const { Schema } = mongoose;

const CitySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true
    },
    district: {
      type: Schema.Types.ObjectId,
      ref: District,
    },
    state: {
      type: Schema.Types.ObjectId,
      ref: State,
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
