const mongoose = require("mongoose");

const { Schema } = mongoose;

const StateSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique:true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const State = mongoose.model("State", StateSchema);

module.exports = State;
