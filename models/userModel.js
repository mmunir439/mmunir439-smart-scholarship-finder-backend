const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student",
    },
    language: {
      type: String,
      enum: ["English", "Urdu"],
      default: "English",
    },
    textToSpeech: {
      type: Boolean,
      default: false,
    },
    emailNotifications: {
      type: Boolean,
      default: true,
    },
    eligibilityAlerts: {
      type: Boolean,
      default: true,
    },
    deadlineReminders: {
      type: Boolean,
      default: true,
    },
    studyRegion: {
      type: String,
      enum: ["USA & Europe", "USA only", "Europe only"],
      default: "USA & Europe",
    },
    preferredDegree: {
      type: String,
      enum: ["All", "Bachelor", "Master", "PhD"],
      default: "All",
    },

    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  { timestamps: true },
);

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
