const mongoose = require("mongoose"); // import mongoose library

// define schema (structure of data in MongoDB)
const scholarshipSchema = new mongoose.Schema({
  name: {
    type: String, // text type
    required: true, // must be provided
  },

  country: {
    type: String,
    required: true,
  },

  degreeLevel: {
    type: String,
    enum: ["Bachelor", "Master", "PhD", "Postdoc", "Other"], // restrict values
  },

  eligibility: {
    type: String, // description of eligibility
  },

  deadline: {
    type: String, // store as text (because formats vary)
  },

  link: {
    type: String,
    required: true,
    unique: true, // prevent duplicate entries
  },

  source: {
    type: String,
    required: true, // must specify source
  },

  scrapedAt: {
    type: Date,
    default: Date.now, // auto add current timestamp
  },
});

// create model from schema
const Scholarship = mongoose.model("Scholarship", scholarshipSchema);

// export model so we can use it in other files
module.exports = Scholarship;
