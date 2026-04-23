// ✅ Fixed scrape.js — always returns array
const axios = require("axios");
const cheerio = require("cheerio");

const scrapeScholarship = async (source) => {
  try {
    const { data } = await axios.get(source.url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      timeout: 10000,
    });

    const $ = cheerio.load(data);
    const scholarships = [];

    // Use source-specific selectors
    if (source.name === "Fulbright") {
      $(".program-item h3 a").each((i, el) => {
        const name = $(el).find("h2, h3, h4, a").first().text().trim();
        if (name && name.length > 5) {
          scholarships.push({
            name: name,
            country: "USA",
            degreeLevel: ["Master", "PhD"],
            minCGPA: 3.0,
            minIELTS: 6.5,
            deadline: $(el).find(".deadline").text().trim(),
            link: source.url,
            source: source.name,
            addedBy: "scraper",
          });
        }
      });
    } else if (source.name === "DAAD") {
      $(".c-teaser, .scholarship-item, article, .js-item").each((i, el) => {
        const name = $(el)
          .find("h2, h3, .c-teaser__title, a")
          .first()
          .text()
          .trim();
        if (name && name.length > 5) {
          scholarships.push({
            name: name,
            country: "Germany",
            degreeLevel: "Bachelor, Master, PhD",
            minCGPA: 2.5,
            minIELTS: 6.0,
            deadline: "Check website",
            link: source.url,
            source: source.name,
            addedBy: "scraper",
          });
        }
      });
    } else if (source.name === "Chevening") {
      $(".scholarship, article, .views-row, .listing-item").each((i, el) => {
        const name = $(el).find("h2, h3, h4, a").first().text().trim();
        if (name && name.length > 5) {
          scholarships.push({
            name: name,
            country: "United Kingdom",
            degreeLevel: "Master",
            minCGPA: 2.8,
            minIELTS: 6.5,
            deadline: "Check website",
            link: source.url,
            source: source.name,
            addedBy: "scraper",
          });
        }
      });
    }

    // ✅ Always return array even if empty
    return scholarships;
  } catch (err) {
    console.error(`❌ Scrape error for ${source.name}:`, err.message);
    return []; // ✅ return empty array not undefined
  }
};

module.exports = scrapeScholarship;
