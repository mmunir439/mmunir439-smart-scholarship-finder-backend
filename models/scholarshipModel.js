const mongoose = require("mongoose");

const scholarshipSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    country: { type: String, required: true },

    degreeLevel: {
      type: String,
      default: "Other",
    },

    field: {
      type: String,
      default: null,
    },

    eligibility: {
      type: String,
      default: "Visit official website",
    },

    minCGPA: {
      type: Number,
      default: null,
    },

    minIELTS: {
      type: Number,
      default: null,
    },

    deadline: {
      type: String,
      default: "Check official website",
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

    addedBy: {
      type: String,
      default: "scraper",
    },

    scrapedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

// Indexes
scholarshipSchema.index({ country: 1 });
scholarshipSchema.index({ degreeLevel: 1 });
scholarshipSchema.index({ field: 1 });
scholarshipSchema.index({ minCGPA: 1 });
scholarshipSchema.index({ minIELTS: 1 });

module.exports = mongoose.model("Scholarship", scholarshipSchema);
