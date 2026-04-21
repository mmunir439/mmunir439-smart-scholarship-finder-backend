const mongoose = require("mongoose");

const studentProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true, // one profile per user
  },
  cgpa: {
    type: Number,
    min: 0,
    max: 4,
  },
  ieltsScore: {
    type: Number,
  },
  degreeLevel: {
    type: String,
    enum: ["Bachelor", "Master", "PhD"],
  },
  fieldOfStudy: {
    type: String,
  },
  targetCountry: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Stdprofile", studentProfileSchema);
