const axios = require("axios");
const cheerio = require("cheerio");
const Scholarship = require("../models/Scholarship");
// import Scholarship model

// reusable function to save ONE scholarship
const saveScholarship = async (data) => {
  try {
    // find existing document by link and update OR insert new one
    const result = await Scholarship.findOneAndUpdate(
      { link: data.link }, // unique condition (link)
      data, // new data
      {
        upsert: true, // create if not exists
        new: true, // return updated document
      },
    );

    return result; // return saved document
  } catch (error) {
    // handle errors safely
    console.error("❌ Error saving scholarship:", error.message);
    return null; // return null if error happens
  }
};

module.exports = saveScholarship; // export function
