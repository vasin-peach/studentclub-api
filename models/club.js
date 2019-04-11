const mongoose = require("mongoose");

const ClubSchema = new mongoose.Schema({
  // important field
  name: {
    type: String,
    required: true,
    triem: true
  },
  owner: [
    {
      prefix: { type: String, trim: true, required: true },
      firstname: { type: String, trim: true, required: true },
      lastname: { type: String, trim: true, required: true }
    }
  ],

  // Common field //

  // image
  img: {
    type: String
  },

  // description
  desc: {
    type: String,
    trim: true
  },

  // user entry & max
  entry: {
    current: { type: Number, trim: true, required: true, default: 0 },
    max: { type: Number, trim: true, required: true }
  },

  //junior, senior, both
  receive: {
    type: String,
    trim: true,
    default: "both"
  },

  created_on: {
    type: Date,
    default: Date.now
  }
});

const Club = mongoose.model("Club", ClubSchema);
module.exports = Club;
