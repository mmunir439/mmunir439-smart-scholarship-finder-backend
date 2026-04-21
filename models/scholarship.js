const mongoose = require("mongoose");

const scholarshipSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  country: {
    type: String,
    required: true
  },

  degree: {
    type: String, // Bachelors, Masters, PhD
    required: true
  },

  field: {
    type: String // Computer Science, Engineering etc
  },

  minCGPA: {
    type: Number
  },

  minIELTS: {
    type: Number
  },

  description: {
    type: String
  },

  link: {
    type: String
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Scholarship", scholarshipSchema);