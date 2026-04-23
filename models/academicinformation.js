const mongoose = require("mongoose");

const AcademicInformationSchema = new mongoose.Schema({
  cgpa: {
    type: Number,
    required: true,
    min: 0,
    max: 4,
  },

  ielts: {
    type: Number,
    min: 0,
    max: 9,
  },

  degreeLevel: {
    type: String,
    required: true,
    enum: ["Bachelor", "Master", "PhD"],
  },

  field: {
    type: String,
    required: true,
    enum: [
      "Computer Science",
      "Business",
      "Engineering",
      "Medicine",
      "Arts",
      "Law",
    ],
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model(
  "AcademicInformation",
  AcademicInformationSchema,
);
