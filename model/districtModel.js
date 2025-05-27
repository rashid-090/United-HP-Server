const mongoose = require("mongoose");
const State = require("./stateModel");

const { Schema } = mongoose;

const DistrictSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
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

const District = mongoose.model("District", DistrictSchema);

module.exports = District;
