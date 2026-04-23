const axios = require("axios");
const cheerio = require("cheerio");
const Scholarship = require("../models/scholarship");

const headers = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept-Language": "en-US,en;q=0.9",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ─────────────────────────────────────────────
// STEP 1 — fetch individual scholarship page
// and extract real details from inside it
// ─────────────────────────────────────────────
async function fetchScholarshipDetails(link) {
  try {
    const { data } = await axios.get(link, { headers, timeout: 20000 });
    const $ = cheerio.load(data);

    // Get all text content from the article body
    const bodyText =
      $(".entry-content").text() ||
      $(".post-content").text() ||
      $("article").text() ||
      $("body").text();

    return {
      deadline: extractDeadline(bodyText),
      eligibility: extractEligibility(bodyText),
      cgpaText: extractCGPA(bodyText),
      ieltsText: extractIELTS(bodyText),
      country: extractCountry(bodyText),
      degreeLevel: extractDegreeLevel(bodyText),
    };
  } catch (err) {
    // If individual page fails, return defaults
    return {
      deadline: "Check website",
      eligibility: "Visit official website for full eligibility details",
      cgpaText: "",
      ieltsText: "",
      country: null,
      degreeLevel: null,
    };
  }
}

// ─────────────────────────────────────────────
// SCRAPER 1 — scholars4dev.com
// Now does deep scraping — visits each scholarship page
// ─────────────────────────────────────────────
async function scrapeScholars4Dev(url) {
  try {
    console.log(`[Scraper] Fetching scholars4dev listing page...`);
    const { data } = await axios.get(url, { headers, timeout: 20000 });
    const $ = cheerio.load(data);
    const scholarships = [];

    // Collect all titles and links from listing page first
    const items = [];
    $("article, .post, .type-post").each((i, el) => {
      const name =
        $(el).find("h2 a").first().text().trim() ||
        $(el).find(".entry-title a").first().text().trim() ||
        $(el).find("h3 a").first().text().trim();

      const link =
        $(el).find("h2 a").first().attr("href") ||
        $(el).find(".entry-title a").first().attr("href") ||
        $(el).find("h3 a").first().attr("href");

      if (!name || name.length < 5 || !link) return;
      items.push({ name, link });
    });

    console.log(
      `[Scraper] scholars4dev → found ${items.length} listings, now fetching details...`,
    );

    // Visit each scholarship page to get real details
    for (const item of items) {
      const details = await fetchScholarshipDetails(item.link);

      scholarships.push({
        name: item.name,
        link: item.link,
        country: details.country || extractCountry(item.name),
        degreeLevel: details.degreeLevel || extractDegreeLevel(item.name),
        // Build a proper eligibility string from real extracted data
        eligibility: buildEligibilityString(details),
        deadline: details.deadline,
        source: "scholars4dev",
        scrapedAt: new Date(),
      });

      // Wait 2 seconds between each page — avoids getting blocked
      await delay(2000);
    }

    console.log(
      `[Scraper] scholars4dev → scraped ${scholarships.length} scholarships with full details`,
    );
    return scholarships;
  } catch (error) {
    console.error(`[Scraper] scholars4dev failed: ${error.message}`);
    return [];
  }
}

// ─────────────────────────────────────────────
// SCRAPER 2 — opportunitiescircle.com
// Also does deep scraping
// ─────────────────────────────────────────────
async function scrapeOpportunitiesCircle(url) {
  try {
    console.log(`[Scraper] Fetching opportunitiescircle listing page...`);
    const { data } = await axios.get(url, { headers, timeout: 20000 });
    const $ = cheerio.load(data);
    const items = [];

    $("article, .post, .jeg_post").each((i, el) => {
      const name = $(el)
        .find("h3 a, h2 a, .jeg_post_title a")
        .first()
        .text()
        .trim();
      const link = $(el)
        .find("h3 a, h2 a, .jeg_post_title a")
        .first()
        .attr("href");
      if (!name || name.length < 5 || !link) return;
      items.push({ name, link });
    });

    console.log(
      `[Scraper] opportunitiescircle → found ${items.length} listings, now fetching details...`,
    );

    const scholarships = [];
    for (const item of items) {
      const details = await fetchScholarshipDetails(item.link);

      scholarships.push({
        name: item.name,
        link: item.link,
        country: details.country || extractCountry(item.name),
        degreeLevel: details.degreeLevel || extractDegreeLevel(item.name),
        eligibility: buildEligibilityString(details),
        deadline: details.deadline,
        source: "opportunitiescircle",
        scrapedAt: new Date(),
      });

      await delay(2000);
    }

    console.log(
      `[Scraper] opportunitiescircle → scraped ${scholarships.length} scholarships with full details`,
    );
    return scholarships;
  } catch (error) {
    console.error(`[Scraper] opportunitiescircle failed: ${error.message}`);
    return [];
  }
}

// ─────────────────────────────────────────────
// BUILD ELIGIBILITY STRING
// combines all extracted real data into one clean string
// ─────────────────────────────────────────────
function buildEligibilityString(details) {
  const parts = [];

  if (details.cgpaText) parts.push(details.cgpaText);
  if (details.ieltsText) parts.push(details.ieltsText);
  if (
    details.eligibility &&
    details.eligibility !==
      "Visit official website for full eligibility details"
  ) {
    parts.push(details.eligibility);
  }

  return parts.length > 0
    ? parts.join(" | ")
    : "Visit official website for full eligibility details";
}

// ─────────────────────────────────────────────
// HELPERS — extract real values from page text
// ─────────────────────────────────────────────

function extractCountry(text) {
  const countries = [
    "USA",
    "United States",
    "UK",
    "United Kingdom",
    "Germany",
    "Australia",
    "Canada",
    "China",
    "Japan",
    "South Korea",
    "France",
    "Italy",
    "Netherlands",
    "Sweden",
    "Norway",
    "Turkey",
    "Malaysia",
    "UAE",
    "Saudi Arabia",
    "Pakistan",
    "Europe",
  ];
  for (const country of countries) {
    if (text.toLowerCase().includes(country.toLowerCase())) return country;
  }
  return "International";
}

function extractDegreeLevel(text) {
  const lower = text.toLowerCase();
  if (lower.includes("phd") || lower.includes("doctorate")) return "PhD";
  if (lower.includes("postdoc")) return "Postdoc";
  if (
    lower.includes("master") ||
    lower.includes("msc") ||
    lower.includes("mba") ||
    lower.includes("graduate")
  )
    return "Master";
  if (
    lower.includes("bachelor") ||
    lower.includes("undergraduate") ||
    lower.includes("bs ") ||
    lower.includes("b.s")
  )
    return "Bachelor";
  return "Other";
}

function extractDeadline(text) {
  // Match: "January 15, 2025" or "15 January 2025"
  const match1 = text.match(
    /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}/i,
  );
  if (match1) return match1[0];

  // Match: "2025-03-15"
  const match2 = text.match(/\d{4}-\d{2}-\d{2}/);
  if (match2) return match2[0];

  // Match: "deadline: 30 April 2025"
  const match3 = text.match(/deadline[:\s]+([^\n.]+\d{4})/i);
  if (match3) return match3[1].trim();

  return "Check official website";
}

function extractCGPA(text) {
  // Match patterns like "CGPA 3.0" or "GPA of 3.5" or "minimum GPA: 3.0"
  const match = text.match(/(?:minimum\s+)?(?:cgpa|gpa)[:\s]+(\d+\.?\d*)/i);
  if (match) return `CGPA ${match[1]}+`;

  // Match "3.0 GPA" pattern
  const match2 = text.match(/(\d+\.?\d*)\s+(?:cgpa|gpa)/i);
  if (match2) return `CGPA ${match2[1]}+`;

  return "";
}

function extractIELTS(text) {
  // Match patterns like "IELTS 6.5" or "IELTS score of 7.0"
  const match = text.match(/ielts[:\s]+(?:score\s+of\s+)?(\d+\.?\d*)/i);
  if (match) return `IELTS ${match[1]}+`;

  // Match "6.5 IELTS" pattern
  const match2 = text.match(/(\d+\.?\d*)\s+ielts/i);
  if (match2) return `IELTS ${match2[1]}+`;

  return "";
}

function extractEligibility(text) {
  // Look for eligibility section in the page
  const match = text.match(/eligibilit(?:y|ies)[:\s]+([^.]+\.)/i);
  if (match) return match[1].trim().substring(0, 200);
  return "";
}

// ─────────────────────────────────────────────
// SEED DATA — always saves, rich eligibility info
// ─────────────────────────────────────────────
function getSeedScholarships() {
  return [
    {
      name: "Fulbright Scholarship Program for Pakistani Students",
      link: "https://pk.usembassy.gov/education-culture/fulbright-program/",
      country: "USA",
      degreeLevel: "Master",
      eligibility:
        "CGPA 3.0+ | IELTS 7.0+ | Open to all fields | Pakistani citizens only",
      deadline: "November 15, 2025",
      source: "seed",
    },
    {
      name: "DAAD Scholarship Germany for Pakistani Students",
      link: "https://www.daad.de/en/study-and-research-in-germany/",
      country: "Germany",
      degreeLevel: "Master",
      eligibility: "CGPA 3.0+ | IELTS 6.5+ | Engineering or Sciences preferred",
      deadline: "October 30, 2025",
      source: "seed",
    },
    {
      name: "Chevening Scholarship UK for Pakistani Students",
      link: "https://www.chevening.org/scholarships/",
      country: "UK",
      degreeLevel: "Master",
      eligibility:
        "CGPA 3.2+ | IELTS 6.5+ | Minimum 2 years work experience required",
      deadline: "November 5, 2025",
      source: "seed",
    },
    {
      name: "Chinese Government Scholarship for Pakistani Students",
      link: "https://www.campuschina.org/scholarships/",
      country: "China",
      degreeLevel: "Bachelor",
      eligibility:
        "CGPA 2.8+ | No IELTS required for Chinese medium programs | All fields",
      deadline: "March 30, 2026",
      source: "seed",
    },
    {
      name: "HEC Need Based Scholarship Pakistan",
      link: "https://www.hec.gov.pk/english/scholarshipsgrants/NBS/Pages/Overview.aspx",
      country: "Pakistan",
      degreeLevel: "Bachelor",
      eligibility: "CGPA 2.5+ | Pakistani citizen | Financially needy families",
      deadline: "August 31, 2025",
      source: "seed",
    },
    {
      name: "Australia Awards Scholarship for Pakistani Students",
      link: "https://www.australiaawardspakistan.org/",
      country: "Australia",
      degreeLevel: "Master",
      eligibility:
        "CGPA 3.0+ | IELTS 6.5+ | Development-related fields preferred",
      deadline: "April 30, 2026",
      source: "seed",
    },
    {
      name: "Turkish Government Scholarship Turkiye Burslari",
      link: "https://www.turkiyeburslari.gov.tr/",
      country: "Turkey",
      degreeLevel: "Bachelor",
      eligibility: "CGPA 2.5+ | No IELTS required | Open to all fields",
      deadline: "February 20, 2026",
      source: "seed",
    },
    {
      name: "KAIST Scholarship South Korea for International Students",
      link: "https://admission.kaist.ac.kr/intl-graduate/",
      country: "South Korea",
      degreeLevel: "PhD",
      eligibility:
        "CGPA 3.5+ | IELTS 6.5+ | Science and Engineering fields only",
      deadline: "September 1, 2025",
      source: "seed",
    },
    {
      name: "Swedish Institute Scholarship for Global Professionals",
      link: "https://si.se/en/apply/scholarships/swedish-institute-scholarships-for-global-professionals/",
      country: "Sweden",
      degreeLevel: "Master",
      eligibility: "CGPA 3.0+ | IELTS 6.5+ | Leadership experience required",
      deadline: "February 10, 2026",
      source: "seed",
    },
    {
      name: "Canada IDRC Research Awards for Pakistani Students",
      link: "https://idrc.ca/en/funding/idrc-doctoral-research-awards",
      country: "Canada",
      degreeLevel: "PhD",
      eligibility:
        "CGPA 3.2+ | IELTS 7.0+ | Development-focused research required",
      deadline: "May 15, 2026",
      source: "seed",
    },
  ];
}

// ─────────────────────────────────────────────
// SAVE TO MONGODB — skips duplicates by link
// ─────────────────────────────────────────────
async function saveToDatabase(scholarships) {
  let saved = 0;
  let skipped = 0;
  let failed = 0;

  for (const scholarship of scholarships) {
    try {
      const exists = await Scholarship.findOne({ link: scholarship.link });
      if (exists) {
        skipped++;
        continue;
      }
      await Scholarship.create(scholarship);
      saved++;
    } catch (err) {
      failed++;
      console.error(
        `[DB] Failed to save: ${scholarship.name} — ${err.message}`,
      );
    }
  }
  console.log(
    `[DB] Saved: ${saved} | Skipped (duplicates): ${skipped} | Failed: ${failed}`,
  );
}

// ─────────────────────────────────────────────
// MAIN — called by scheduler.js
// ─────────────────────────────────────────────
async function runScraper() {
  console.log("\n========================================");
  console.log("[Scraper] Starting scholarship scraper...");
  console.log("========================================\n");

  let allScholarships = [];

  // Deep scrape scholars4dev
  const s4d = await scrapeScholars4Dev(
    "https://www.scholars4dev.com/category/scholarships-for-pakistanis/",
  );
  allScholarships = [...allScholarships, ...s4d];
  await delay(3000);

  // Deep scrape opportunitiescircle
  const opc = await scrapeOpportunitiesCircle(
    "https://opportunitiescircle.com/category/scholarships/",
  );
  allScholarships = [...allScholarships, ...opc];
  await delay(2000);

  // Always add seed data
  allScholarships = [...allScholarships, ...getSeedScholarships()];

  console.log(
    `\n[Scraper] Total scholarships to save: ${allScholarships.length}`,
  );
  await saveToDatabase(allScholarships);
  console.log("\n[Scraper] Scraping complete!\n");
}

module.exports = { runScraper };
