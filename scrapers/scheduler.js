const cron = require("node-cron");
const { runScraper } = require("./scrape");

function startScheduler() {
  // Run scraper in background — do not block server startup
  console.log("[Scheduler] Starting background scrape...");
  runScraper().catch((err) => console.error("[Scheduler] Scrape error:", err.message));

  cron.schedule("0 0 * * *", () => {
    console.log("[Scheduler] Daily scrape starting...");
    runScraper().catch((err) => console.error("[Scheduler] Scrape error:", err.message));
  });

  console.log("[Scheduler] Active — scrapes on start + daily at midnight");
}

module.exports = { startScheduler };
