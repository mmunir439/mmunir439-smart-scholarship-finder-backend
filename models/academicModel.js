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
      enum: [
        0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5,
        9,
      ],
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
      enum: [
        "Computer Science",
        "Software Engineering",
        "Business Administration",
        "Electrical Engineering",
        "Mechanical Engineering",
        "Civil Engineering",
        "Medicine",
        "Law",
        "Finance",
        "Marketing",
        "Psychology",
        "Data Science",
        "Artificial Intelligence",
        "Information Technology",
        "Economics",
        "Architecture",
        "Biotechnology",
        "Physics",
        "Mathematics",
        "Other",
      ],
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  },
);

module.exports = mongoose.model("academicProfile", academicInformationSchema);
