const mongoose = require("mongoose");

const stdSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  cgpa: Number,
  ielts: Number,
  degreeLevel: String,
  academicField: String
});

const Student = mongoose.model("Student", stdSchema);

module.exports = {Student};