const mongoose = require("mongoose");

const scholarshipSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  country: String,

  degreeLevel: [
    {
      type: String,
      enum: ["Bachelor", "Master", "PhD"],
    },
  ],

  minCGPA: {
    type: Number,
    default: 0,
  },

  minIELTS: {
    type: Number,
    default: 0,
  },

  fieldOfStudy: [String],

  deadline: Date,
  link: String,
  description: String,
  source: String,

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Scholarship", scholarshipSchema);
