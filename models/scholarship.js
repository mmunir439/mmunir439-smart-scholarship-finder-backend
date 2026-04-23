// models/Scholarship.js
const mongoose = require("mongoose");

const scholarshipSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    country: { type: String },
    degreeLevel: { type: String }, // Bachelor, Master, PhD
    field: { type: String },
    minCGPA: { type: Number },
    minIELTS: { type: Number },
    deadline: { type: String },
    degreeLevel: ["Master", "PhD"],
    link: { type: String, unique: true },
    source: { type: String }, // Scraped or Admin-added
    addedBy: { type: String, default: "scraper" }, // "scraper" or "admin"
  },
  { timestamps: true },
);

module.exports = mongoose.model("Scholarship", scholarshipSchema);
