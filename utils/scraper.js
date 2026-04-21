const axios = require('axios');
const cheerio = require('cheerio');
const Scholarship = require('../models/Scholarship');

const scrapeScholarships = async () => {
  try {
    const url = 'https://www.scholars4dev.com';

    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    let operations = [];

    $('.entry-title a').each((i, el) => {
      const name = $(el).text().trim();
      const link = $(el).attr('href');

      // Dummy extraction (real sites vary)
      const country = "Unknown";
      const degreeLevel = ["Master"];
      const deadline = new Date();
      const description = name;

      operations.push({
        updateOne: {
          filter: { link }, // avoid duplicates
          update: {
            name,
            link,
            country,
            degreeLevel,
            description,
            source: "scholars4dev"
          },
          upsert: true
        }
      });
    });

    const result = await Scholarship.bulkWrite(operations);

    return {
      inserted: result.upsertedCount,
      updated: result.modifiedCount,
      total: operations.length
    };

  } catch (error) {
    throw new Error("Scraping failed: " + error.message);
  }
};

module.exports = scrapeScholarships;