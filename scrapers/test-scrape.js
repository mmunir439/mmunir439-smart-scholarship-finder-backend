/**
 * Quick test — saves whatever data is extracted (no field minimum).
 * Usage: node scrapers/test-scrape.js
 */
require("dotenv").config();

const { fetchHtmlRobust, closeBrowser } = require("./fetchPage");
const {
  extractDetailsFromHtml,
  extractListingsFromHtml,
  buildEligibilityString,
  extractDegreeLevel,
  extractField,
} = require("./extractors");

const S4D_BODY = ".col-lg-8, .page-section, .card-body, .accordion, .entry-content";

async function main() {
  try {
    const listingUrl =
      "https://www.scholars4dev.com/category/scholarships-by-level/masters-scholarships/";
    const html = await fetchHtmlRobust(listingUrl, { dynamic: false });
    const source = {
      url: listingUrl,
      selectors: { listing: ".post", title: "h2 a", link: "h2 a", body: S4D_BODY },
    };
    const listings = extractListingsFromHtml(html, source).slice(0, 3);

    console.log(`Found ${listings.length} listings (showing first 3)\n`);

    for (const item of listings) {
      const detailHtml = await fetchHtmlRobust(item.link, { dynamic: false });
      const details = extractDetailsFromHtml(detailHtml, S4D_BODY, item.name);
      if (!details.degreeLevel) details.degreeLevel = extractDegreeLevel(item.name) || "Master";
      if (!details.field) details.field = extractField(item.name);

      const built = buildEligibilityString(details);
      console.log(item.name.substring(0, 55));
      console.log(`  link: ${item.link}`);
      console.log(`  CGPA: ${built.minCGPA ?? "null"} | IELTS: ${built.minIELTS ?? "null"}`);
      console.log(`  degree: ${details.degreeLevel} | field: ${details.field ?? "null"}`);
      console.log(`  deadline: ${details.deadline}`);
      console.log("");
    }

    console.log("✓ All scraped data would be saved to DB\n");
  } catch (err) {
    console.error("✗ Test failed:", err.message);
    process.exit(1);
  } finally {
    await closeBrowser();
  }
}

main();
