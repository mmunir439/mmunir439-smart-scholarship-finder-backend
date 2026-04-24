const mongoose = require("mongoose");

const scholarshipSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  degreeLevel: {
    type: String,
    enum: ["Bachelor", "Master", "PhD", "Postdoc", "Other"],
  },
  eligibility: {
    type: String,
  },
  deadline: {
    type: String,
  },
  link: {
    type: String,
    required: true,
    unique: true,
  },
  source: {
    type: String,
    required: true,
  },
  scrapedAt: {
    type: Date,
    default: Date.now,
  },
});

// ✅ FIX HERE
const Scholarship =
  mongoose.models.Scholarship ||
  mongoose.model("Scholarship", scholarshipSchema);

module.exports = Scholarship;
