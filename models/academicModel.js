const mongoose = require("mongoose");

const academicInformationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    cgpa: {
      type: Number,
      required: true,
      min: 0,
      max: 4, // adjust if your system uses 5.0 scale
    },
    ielts: {
      type: Number,
      required: true,
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
      trim: true,
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  },
);

module.exports = mongoose.model("profileAcademic", academicInformationSchema);
