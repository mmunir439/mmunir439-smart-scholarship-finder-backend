const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["student", "admin"],
    default: "student",
  },

  // Only for students
  studentProfile: {
    cgpa: Number,
    ielts: Number,
    degreeLevel: String,
    academicField: String,
  },
});

const User = mongoose.model("User", userSchema);
module.exports = User;
