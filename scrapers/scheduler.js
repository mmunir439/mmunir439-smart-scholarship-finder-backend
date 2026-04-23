const cron = require("node-cron");
const scrapeScholarship = require("./scrape");
const sources = require("./sources");
const Scholarship = require("../models/Scholarship"); // ✅ needed for saveScrapedData

// ✅ Fix 1 — saveScrapedData defined here
const saveScholarship = require("../utils/scraper");

const saveScrapedData = async (scholarships) => {
  for (const item of scholarships) {
    await saveScholarship(item); // call reusable function
  }

  console.log(`💾 ${scholarships.length} scholarships saved/updated`);
};

// ✅ Fix 2 — wrap everything inside a named function
const startScheduler = () => {
  // Run once immediately when server starts
  console.log("🚀 Running initial scrape on startup...");
  (async () => {
    for (const source of sources) {
      try {
        const data = await scrapeScholarship(source);
        await saveScrapedData(data);
      } catch (err) {
        console.error(`❌ Failed scraping ${source.name}:`, err.message);
      }
    }
    console.log("✅ Initial scrape complete");
  })();

  // Auto run every Sunday at midnight
  cron.schedule("0 0 * * 0", async () => {
    console.log("⏰ Weekly auto scrape started...");
    for (const source of sources) {
      await new Promise((r) => setTimeout(r, 2000)); // 2 sec delay {
      try {
        const data = await scrapeScholarship(source);
        await saveScrapedData(data);
      } catch (err) {
        console.error(`❌ Failed scraping ${source.name}:`, err.message);
      }
    }
    console.log("✅ Weekly scrape complete");
  });
};

// ✅ Fix 3 — export the function
module.exports = startScheduler;
