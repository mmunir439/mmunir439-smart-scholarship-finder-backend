const axios = require("axios");
const cheerio = require("cheerio");
const Scholarship = require("../models/scholarshipModel");
const sources = require("./sources");

const headers = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept-Language": "en-US,en;q=0.9",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ─────────────────────────────────────────────────────────────
// ROUTER — picks the right scraper strategy based on source.type
//
// To add a new source:
//   - If static HTML blog: add to sources.js with type "generic_blog" + selectors
//   - If JS-rendered official portal: add with type "static_fallback" + fallback data
// ─────────────────────────────────────────────────────────────
async function scrapeSource(source) {
  console.log(
    `\n[Scraper] → Processing: ${source.name} (type: ${source.type})`,
  );

  switch (source.type) {
    case "generic_blog":
      return scrapeGenericBlog(source);

    // FIX: added static_fallback case — handles JS-rendered official portals
    case "static_fallback":
      return [buildStaticFallback(source, source.fallback)];

    // Legacy strategies kept for backward compatibility
    case "daad":
      return scrapeDAAD(source);
    case "stipendium_hungaricum":
      return scrapeStipendiumHungaricum(source);
    case "turkiye_burslari":
      return scrapeTurkiyeBurslari(source);
    case "csc_china":
      return scrapeCSCChina(source);

    default:
      console.warn(
        `[Scraper] Unknown type "${source.type}" for ${source.name} — skipping.`,
      );
      return [];
  }
}

// ─────────────────────────────────────────────────────────────
// STRATEGY 1 — Generic blog/listing scraper (static HTML only)
// Uses configurable CSS selectors from sources.js
// Only use this for sites that do NOT require JavaScript rendering
// ─────────────────────────────────────────────────────────────
async function scrapeGenericBlog(source) {
  // Guard: if selectors are missing, log a clear error and skip
  if (!source.selectors || !source.selectors.listing) {
    console.error(
      `[Scraper] ${source.name} → Missing selectors. Add selectors to sources.js for this source.`,
    );
    return [];
  }

  try {
    const timeout = source.timeout || 20000;
    const { data } = await axios.get(source.url, { headers, timeout });
    const $ = cheerio.load(data);
    const items = [];

    $(source.selectors.listing).each((_, el) => {
      const name = $(el).find(source.selectors.title).first().text().trim();
      const rawLink = $(el).find(source.selectors.link).first().attr("href");

      // Resolve relative links to absolute
      let link = rawLink;
      if (link && !link.startsWith("http")) {
        const base = new URL(source.url);
        link = `${base.origin}${link.startsWith("/") ? "" : "/"}${link}`;
      }

      if (!name || name.length < 5 || !link) return;
      items.push({ name, link });
    });

    // Debug sweep: if 0 listings found, log element counts to help fix selectors
    if (items.length === 0) {
      const fallbacks = [
        "article",
        ".post",
        ".hentry",
        "h2 a",
        "h3 a",
        ".entry-title a",
      ];
      const counts = fallbacks.map((s) => `${s}(${$(s).length})`).join(", ");
      console.warn(
        `[Scraper] ${source.name} → 0 listings with selector "${source.selectors.listing}". ` +
          `Element counts on page: ${counts}. Update selectors in sources.js.`,
      );
      return [];
    }

    console.log(`[Scraper] ${source.name} → found ${items.length} listings`);

    const scholarships = [];
    for (const item of items) {
      const details = await fetchPageDetails(item.link, source.selectors.body);
      const built = buildEligibilityString(details);

      scholarships.push({
        name: item.name,
        link: item.link,
        country:
          details.country ||
          extractCountry(item.name) ||
          source.country ||
          "International",
        degreeLevel:
          details.degreeLevel || extractDegreeLevel(item.name) || "Other",
        field: details.field || extractField(item.name) || "General",
        eligibility: built.eligibility,
        minCGPA: built.minCGPA,
        // FIX: was "ielts" — schema field is "minIELTS"
        minIELTS: built.minIELTS,
        deadline: details.deadline || "Check official website",
        source: source.name,
        scrapedAt: new Date(),
      });

      await delay(2000);
    }

    console.log(
      `[Scraper] ${source.name} → scraped ${scholarships.length} scholarships`,
    );
    return scholarships;
  } catch (error) {
    console.error(`[Scraper] ${source.name} failed: ${error.message}`);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────
// STRATEGY 2 — DAAD Germany (legacy — kept for backward compat)
// NOTE: DAAD uses JS rendering. Prefer type "static_fallback" in sources.js
// ─────────────────────────────────────────────────────────────
async function scrapeDAAD(source) {
  try {
    const { data } = await axios.get(source.url, { headers, timeout: 20000 });
    const $ = cheerio.load(data);
    const scholarships = [];

    $(".c-result-item, .item-scholarship, article").each((_, el) => {
      const name = $(el).find("h3, h2, .item-title, a").first().text().trim();
      const link = $(el).find("a").first().attr("href") || source.url;
      const fullLink = link.startsWith("http")
        ? link
        : `https://www2.daad.de${link}`;
      const deadlineRaw = $(el)
        .find(".deadline, .date, time")
        .first()
        .text()
        .trim();
      const description = $(el).find("p, .description").first().text().trim();

      if (!name || name.length < 5) return;

      const daadBuilt = buildEligibilityString({
        cgpaText: extractCGPA(description),
        ieltsText: extractIELTS(description),
        eligibility: description.substring(0, 200),
      });

      scholarships.push({
        name,
        link: fullLink,
        country: source.country,
        degreeLevel: source.degreeLevel || "Other",
        field: extractField(name + " " + description) || "General",
        eligibility: daadBuilt.eligibility,
        minCGPA: daadBuilt.minCGPA,
        // FIX: was "ielts"
        minIELTS: daadBuilt.minIELTS,
        deadline: deadlineRaw || "Check official DAAD website",
        source: source.name,
        scrapedAt: new Date(),
      });
    });

    if (scholarships.length === 0) {
      scholarships.push(
        buildStaticFallback(source, {
          name: "DAAD Scholarships for Pakistani Students",
          eligibility:
            "CGPA 3.0+ | IELTS 6.5+ | Engineering or Sciences preferred",
          minCGPA: 3.0,
          minIELTS: 6.5,
          deadline: "October 30, 2025",
        }),
      );
    }

    console.log(
      `[Scraper] ${source.name} → ${scholarships.length} scholarships`,
    );
    return scholarships;
  } catch (error) {
    console.error(`[Scraper] ${source.name} failed: ${error.message}`);
    return [
      buildStaticFallback(source, {
        name: "DAAD Scholarships for Pakistani Students",
        eligibility:
          "CGPA 3.0+ | IELTS 6.5+ | Engineering or Sciences preferred",
        minCGPA: 3.0,
        minIELTS: 6.5,
        deadline: "October 30, 2025",
      }),
    ];
  }
}

// ─────────────────────────────────────────────────────────────
// STRATEGY 3 — Stipendium Hungaricum (legacy)
// ─────────────────────────────────────────────────────────────
async function scrapeStipendiumHungaricum(source) {
  try {
    const { data } = await axios.get(source.url, { headers, timeout: 20000 });
    const $ = cheerio.load(data);
    const scholarships = [];

    $(".program-item, .scholarship-card, article, .entry, li").each((_, el) => {
      const name = $(el).find("h2, h3, a, .title").first().text().trim();
      const link = $(el).find("a").first().attr("href") || source.url;
      const fullLink = link.startsWith("http")
        ? link
        : `https://stipendiumhungaricum.hu${link}`;
      if (!name || name.length < 5) return;

      const shElig = parseEligibility(
        "CGPA 3.0+ | No IELTS required | Open to all nationalities | Full tuition + stipend",
      );
      scholarships.push({
        name,
        link: fullLink,
        country: source.country,
        degreeLevel: source.degreeLevel || "Other",
        field: "General",
        eligibility: shElig.eligibility,
        minCGPA: shElig.minCGPA,
        // FIX: was "ielts"
        minIELTS: shElig.minIELTS,
        deadline: "January 15, 2026",
        source: source.name,
        scrapedAt: new Date(),
      });
    });

    if (scholarships.length === 0) {
      scholarships.push(
        buildStaticFallback(source, {
          name: "Stipendium Hungaricum Scholarship 2026",
          eligibility:
            "CGPA 3.0+ | No IELTS required | Open to all fields | Full scholarship",
          minCGPA: 3.0,
          minIELTS: null,
          deadline: "January 15, 2026",
        }),
      );
    }

    console.log(
      `[Scraper] ${source.name} → ${scholarships.length} scholarships`,
    );
    return scholarships;
  } catch (error) {
    console.error(`[Scraper] ${source.name} failed: ${error.message}`);
    return [
      buildStaticFallback(source, {
        name: "Stipendium Hungaricum Scholarship 2026",
        eligibility:
          "CGPA 3.0+ | No IELTS required | Open to all fields | Full scholarship",
        minCGPA: 3.0,
        minIELTS: null,
        deadline: "January 15, 2026",
      }),
    ];
  }
}

// ─────────────────────────────────────────────────────────────
// STRATEGY 4 — Türkiye Bursları (legacy)
// ─────────────────────────────────────────────────────────────
async function scrapeTurkiyeBurslari(source) {
  try {
    const { data } = await axios.get(source.url, { headers, timeout: 20000 });
    const $ = cheerio.load(data);
    const scholarships = [];

    $(".scholarship-item, .program, article, .card").each((_, el) => {
      const name = $(el).find("h2, h3, .title, a").first().text().trim();
      const link = $(el).find("a").first().attr("href") || source.url;
      const fullLink = link.startsWith("http")
        ? link
        : `https://www.turkiyeburslari.gov.tr${link}`;
      if (!name || name.length < 5) return;

      const tbElig = parseEligibility(
        "CGPA 2.5+ | No IELTS required | Full scholarship + monthly stipend",
      );
      scholarships.push({
        name,
        link: fullLink,
        country: source.country,
        degreeLevel: source.degreeLevel || "Other",
        field: "General",
        eligibility: tbElig.eligibility,
        minCGPA: tbElig.minCGPA,
        // FIX: was "ielts"
        minIELTS: tbElig.minIELTS,
        deadline: "February 20, 2026",
        source: source.name,
        scrapedAt: new Date(),
      });
    });

    if (scholarships.length === 0) {
      scholarships.push(
        buildStaticFallback(source, {
          name: "Türkiye Bursları (Turkish Government Scholarship) 2026",
          eligibility:
            "CGPA 2.5+ | No IELTS required | Open to all fields | Full scholarship",
          minCGPA: 2.5,
          minIELTS: null,
          deadline: "February 20, 2026",
        }),
      );
    }

    console.log(
      `[Scraper] ${source.name} → ${scholarships.length} scholarships`,
    );
    return scholarships;
  } catch (error) {
    console.error(`[Scraper] ${source.name} failed: ${error.message}`);
    return [
      buildStaticFallback(source, {
        name: "Türkiye Bursları (Turkish Government Scholarship) 2026",
        eligibility:
          "CGPA 2.5+ | No IELTS required | Open to all fields | Full scholarship",
        minCGPA: 2.5,
        minIELTS: null,
        deadline: "February 20, 2026",
      }),
    ];
  }
}

// ─────────────────────────────────────────────────────────────
// STRATEGY 5 — Chinese Scholarship Council (legacy)
// ─────────────────────────────────────────────────────────────
async function scrapeCSCChina(source) {
  try {
    const { data } = await axios.get(source.url, { headers, timeout: 20000 });
    const $ = cheerio.load(data);
    const scholarships = [];

    $("article, .post, .scholarship, .card").each((_, el) => {
      const name = $(el).find("h2, h3, a, .title").first().text().trim();
      const link = $(el).find("a").first().attr("href") || source.url;
      const fullLink = link.startsWith("http")
        ? link
        : `https://www.chinesescholarshipcouncil.com${link}`;
      if (!name || name.length < 5) return;

      const cscElig = parseEligibility(
        "CGPA 2.8+ | No IELTS required for Chinese medium | All fields",
      );
      scholarships.push({
        name,
        link: fullLink,
        country: source.country,
        degreeLevel: source.degreeLevel || "Other",
        field: extractField(name) || "General",
        eligibility: cscElig.eligibility,
        minCGPA: cscElig.minCGPA,
        // FIX: was "ielts"
        minIELTS: cscElig.minIELTS,
        deadline: "March 30, 2026",
        source: source.name,
        scrapedAt: new Date(),
      });
    });

    if (scholarships.length === 0) {
      scholarships.push(
        buildStaticFallback(source, {
          name: "Chinese Government Scholarship (CSC) 2026",
          eligibility:
            "CGPA 2.8+ | No IELTS required for Chinese medium | All fields",
          minCGPA: 2.8,
          minIELTS: null,
          deadline: "March 30, 2026",
        }),
      );
    }

    console.log(
      `[Scraper] ${source.name} → ${scholarships.length} scholarships`,
    );
    return scholarships;
  } catch (error) {
    console.error(`[Scraper] ${source.name} failed: ${error.message}`);
    return [
      buildStaticFallback(source, {
        name: "Chinese Government Scholarship (CSC) 2026",
        eligibility:
          "CGPA 2.8+ | No IELTS required for Chinese medium | All fields",
        minCGPA: 2.8,
        minIELTS: null,
        deadline: "March 30, 2026",
      }),
    ];
  }
}

// ─────────────────────────────────────────────────────────────
// HELPER — builds a fallback scholarship entry for JS-rendered
// official portals that cheerio cannot scrape dynamically.
//
// FIX: overrides.minCGPA and overrides.minIELTS are now used
//      directly if provided, skipping regex parsing on a string.
//      Field name corrected from "ielts" to "minIELTS" throughout.
// ─────────────────────────────────────────────────────────────
function buildStaticFallback(source, overrides = {}) {
  // If minCGPA/minIELTS are explicitly provided as numbers, use them directly.
  // Otherwise fall back to parsing the eligibility string.
  let minCGPA = overrides.minCGPA !== undefined ? overrides.minCGPA : null;
  let minIELTS = overrides.minIELTS !== undefined ? overrides.minIELTS : null;
  let eligibility =
    overrides.eligibility ||
    "Visit official website for full eligibility details";

  // Only run regex if numeric values were not provided
  if (minCGPA === null || minIELTS === null) {
    const parsed = parseEligibility(eligibility);
    if (minCGPA === null) minCGPA = parsed.minCGPA;
    if (minIELTS === null) minIELTS = parsed.minIELTS;
  }

  return {
    name: overrides.name || `${source.name} Scholarship`,
    link: source.url,
    country: source.country || "International",
    degreeLevel: overrides.degreeLevel || source.degreeLevel || "Other",
    field: overrides.field || "General",
    eligibility,
    minCGPA,
    // FIX: field name is "minIELTS" to match the Mongoose schema
    minIELTS,
    deadline: overrides.deadline || "Check official website",
    source: source.name,
    scrapedAt: new Date(),
  };
}

// ─────────────────────────────────────────────────────────────
// FETCH — visits an individual scholarship page and extracts details
// ─────────────────────────────────────────────────────────────
async function fetchPageDetails(link, bodySelector) {
  try {
    const { data } = await axios.get(link, { headers, timeout: 20000 });
    const $ = cheerio.load(data);

    // Step 1: get richest plain text across all selectors
    const selectors = bodySelector
      ? bodySelector.split(",").map((s) => s.trim())
      : [".entry-content", ".post-content", "article", "body"];

    let bodyText = "";
    for (const sel of selectors) {
      const found = $(sel).text().trim();
      if (found.length > bodyText.length) bodyText = found;
    }
    if (!bodyText) bodyText = $("body").text();

    // Normalise collapsed HTML text: "IELTS6.5" -> "IELTS 6.5"
    const normalised = bodyText
      .replace(/([A-Za-z])(\d)/g, "$1 $2")
      .replace(/(\d)([A-Za-z])/g, "$1 $2")
      .replace(/\s+/g, " ");

    // Step 2: extract <li> bullet points near eligibility headings
    let eligibilityBullets = [];

    $("h1, h2, h3, h4, strong, b, td, th").each((_, el) => {
      const headingText = $(el).text().trim().toLowerCase();
      if (
        headingText.includes("eligib") ||
        headingText.includes("criteria") ||
        headingText.includes("requirement")
      ) {
        const nextList = $(el)
          .next("ul, ol")
          .add($(el).parent().next("ul, ol"));
        nextList.find("li").each((_, li) => {
          const t = $(li).text().trim();
          if (t.length > 3) eligibilityBullets.push(t);
        });
        const nextPara = $(el).next("p, div").first().text().trim();
        if (nextPara.length > 10) eligibilityBullets.push(nextPara);
      }
    });

    // Step 3: extract <table> key-value rows (IELTS, CGPA, Deadline)
    let tableData = { cgpa: "", ielts: "", deadline: "" };
    $("table tr").each((_, row) => {
      const cells = $(row)
        .find("td, th")
        .map((_, c) => $(c).text().trim())
        .get();
      if (cells.length >= 2) {
        const key = cells[0].toLowerCase();
        const val = cells[1];
        if (/cgpa|gpa/.test(key)) tableData.cgpa = val;
        if (/ielts|english/.test(key)) tableData.ielts = val;
        if (/deadline|last date/.test(key)) tableData.deadline = val;
      }
    });

    // Step 4: merge all sources and return
    const cgpaText = tableData.cgpa
      ? `CGPA ${tableData.cgpa.match(/\d+\.?\d*/)?.[0] || tableData.cgpa}+`
      : extractCGPA(normalised);
    const ieltsText = tableData.ielts
      ? `IELTS ${tableData.ielts.match(/\d+\.?\d*/)?.[0] || tableData.ielts}+`
      : extractIELTS(normalised);
    const deadline = tableData.deadline || extractDeadline(normalised);

    let eligibility = "";
    if (eligibilityBullets.length > 0) {
      eligibility = eligibilityBullets
        .slice(0, 4)
        .join(" | ")
        .substring(0, 400);
    } else {
      eligibility = extractEligibility(normalised);
    }

    return {
      deadline,
      eligibility,
      cgpaText,
      ieltsText,
      country: extractCountry(normalised),
      degreeLevel: extractDegreeLevel(normalised),
      field: extractField(normalised),
    };
  } catch {
    return {
      deadline: "Check official website",
      eligibility: "Visit official website for full eligibility details",
      cgpaText: "",
      ieltsText: "",
      country: null,
      degreeLevel: null,
      field: null,
    };
  }
}

// ─────────────────────────────────────────────────────────────
// EXTRACTION HELPERS
// ─────────────────────────────────────────────────────────────

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
    "Hungary",
    "New Zealand",
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

function extractField(text) {
  const lower = text.toLowerCase();
  if (lower.includes("engineer") || lower.includes("stem"))
    return "Engineering";
  if (
    lower.includes("business") ||
    lower.includes("mba") ||
    lower.includes("management")
  )
    return "Business";
  if (
    lower.includes("medicine") ||
    lower.includes("medical") ||
    lower.includes("health")
  )
    return "Medicine";
  if (
    lower.includes("computer") ||
    lower.includes("software") ||
    lower.includes("it ")
  )
    return "Computer Science";
  if (lower.includes("law") || lower.includes("legal")) return "Law";
  if (
    lower.includes("art") ||
    lower.includes("design") ||
    lower.includes("creative")
  )
    return "Arts";
  if (lower.includes("science") || lower.includes("research"))
    return "Sciences";
  if (lower.includes("social") || lower.includes("development"))
    return "Social Sciences";
  return null;
}

function extractDeadline(text) {
  const match1 = text.match(
    /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}/i,
  );
  if (match1) return match1[0];

  const match2 = text.match(/\d{4}-\d{2}-\d{2}/);
  if (match2) return match2[0];

  const match3 = text.match(/deadline[:\s]+([^\n.]+\d{4})/i);
  if (match3) return match3[1].trim();

  return "Check official website";
}

function extractCGPA(text) {
  const match = text.match(/(?:minimum\s+)?(?:cgpa|gpa)[:\-\s]*(\d+\.?\d*)/i);
  if (match) return `CGPA ${match[1]}+`;
  const match2 = text.match(/(\d+\.?\d*)\s*(?:cgpa|gpa)/i);
  if (match2) return `CGPA ${match2[1]}+`;
  return "";
}

function extractIELTS(text) {
  const match = text.match(/ielts[:\-\s]*(?:score\s*(?:of\s*)?)?(\d+\.?\d*)/i);
  if (match) return `IELTS ${match[1]}+`;
  const match2 = text.match(/(\d+\.?\d*)\s*ielts/i);
  if (match2) return `IELTS ${match2[1]}+`;
  return "";
}

function extractEligibility(text) {
  const match = text.match(/eligibilit(?:y|ies)[:\-\s]+([^.]{10,}\.)/i);
  if (match) return match[1].trim().substring(0, 300);
  return "";
}

// ─────────────────────────────────────────────────────────────
// buildEligibilityString — merges cgpaText + ieltsText + eligibility
// into one display string, and parses numeric values for DB indexing.
//
// FIX: return key renamed from "ielts" to "minIELTS" everywhere
// ─────────────────────────────────────────────────────────────
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

  const eligibility =
    parts.length > 0
      ? parts.join(" | ")
      : "Visit official website for full eligibility details";

  const cgpaMatch = details.cgpaText && details.cgpaText.match(/(\d+\.?\d*)/);
  const ieltsMatch =
    details.ieltsText && details.ieltsText.match(/(\d+\.?\d*)/);

  return {
    eligibility,
    minCGPA: cgpaMatch ? parseFloat(cgpaMatch[1]) : null,
    // FIX: was "ielts" — must match schema field "minIELTS"
    minIELTS: ieltsMatch ? parseFloat(ieltsMatch[1]) : null,
  };
}

// ─────────────────────────────────────────────────────────────
// parseEligibility — parses a human-readable eligibility string
// and extracts numeric minCGPA and minIELTS for DB storage.
//
// FIX: return key renamed from "ielts" to "minIELTS"
// ─────────────────────────────────────────────────────────────
function parseEligibility(eligibilityStr) {
  const cgpaMatch = eligibilityStr.match(/cgpa[\s:]*([\d.]+)/i);
  const ieltsMatch = eligibilityStr.match(/ielts[\s:]*([\d.]+)/i);
  return {
    eligibility: eligibilityStr,
    minCGPA: cgpaMatch ? parseFloat(cgpaMatch[1]) : null,
    // FIX: was "ielts"
    minIELTS: ieltsMatch ? parseFloat(ieltsMatch[1]) : null,
  };
}

// ─────────────────────────────────────────────────────────────
// SAVE TO MONGODB — skips duplicates by link
// ─────────────────────────────────────────────────────────────
async function saveToDatabase(scholarships) {
  let saved = 0,
    skipped = 0,
    failed = 0;

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

// ─────────────────────────────────────────────────────────────
// MAIN — iterates all sources from sources.js
// To add a new source: edit sources.js only.
// ─────────────────────────────────────────────────────────────
async function runScraper() {
  console.log("\n========================================");
  console.log("[Scraper] Starting scholarship scraper...");
  console.log(`[Scraper] Total sources loaded: ${sources.length}`);
  console.log("========================================\n");

  let allScholarships = [];

  for (const source of sources) {
    const results = await scrapeSource(source);
    allScholarships = [...allScholarships, ...results];
    await delay(3000);
  }

  console.log(
    `\n[Scraper] Total scholarships collected: ${allScholarships.length}`,
  );
  await saveToDatabase(allScholarships);
  console.log("\n[Scraper] Scraping complete!\n");
}

module.exports = { runScraper };
