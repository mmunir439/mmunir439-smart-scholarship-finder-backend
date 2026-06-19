/**
 * Standalone scraper — run without starting the full server.
 * Usage: npm run scrape
 */
require("dotenv").config();
const connectDB = require("../config/db");
const { runScraper } = require("./scrape");

connectDB().then(() => runScraper()).catch((err) => {
  console.error(err);
  process.exit(1);
});
