const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  // important field
  studentId: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true
  },
  permission: {
    type: Number,
    required: true
  },
  // start study
  admission_date: {
    type: String,
  },
  // educate level:4 class:3
  education: {
    level: {
      type: Number,
      trim: true,
      required: true
    },
    class: {
      type: Number, trim: true, required: true
    }
  },

  // Common field //
  prefix: {
    type: String,
    trim: true
  },

  // firstname
  firstname: {
    type: String,
    trim: true
  },
  // lastname
  lastname: {
    type: String,
    trim: true
  },
  // tel
  tel: {
    type: String,
    trim: true
  },
  // entry club
  club: {
    type: String,
    trim: true
  },

  // Auto filed //
  created_on: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model("User", UserSchema);
module.exports = User;