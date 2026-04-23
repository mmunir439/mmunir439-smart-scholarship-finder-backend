const cron = require("node-cron");
const { runScraper } = require("./scrape");

// ─────────────────────────────────────────────
// Run scraper ONCE immediately when server starts
// ─────────────────────────────────────────────
async function startScheduler() {
  console.log("[Scheduler] Running scraper on server start...");
  await runScraper();

  // ─────────────────────────────────────────────
  // Then run automatically every 24 hours
  // Cron format: "0 0 * * *" = every day at midnight
  // ─────────────────────────────────────────────
  cron.schedule("0 0 * * *", async () => {
    console.log("[Scheduler] Running scheduled scrape (every 24 hours)...");
    await runScraper();
  });

  console.log("[Scheduler] Scheduler is active — scraper runs every 24 hours.");
}

module.exports = { startScheduler };
