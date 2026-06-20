const cheerio = require("cheerio");
const Scholarship = require("../models/scholarshipModel");
const sources = require("./sources");
const { fetchHtmlRobust, closeBrowser } = require("./fetchPage");
const {
  extractCountry,
  extractDegreeLevel,
  extractField,
  extractCGPA,
  extractIELTS,
  buildEligibilityString,
  extractDetailsFromHtml,
  extractListingsFromHtml,
  mergeExtractedDetails,
  findEligibilityLinks,
  findOfficialLinks,
} = require("./extractors");

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const DEFAULT_BODY_SELECTOR =
  ".col-lg-8, .page-section, .card-body, .accordion, .entry-content, .post-content, main, article, #content, body";

async function scrapeSource(source) {
  console.log(`\n[Scraper] → ${source.name} (${source.type})`);

  switch (source.type) {
    case "generic_blog":
      return scrapeGenericBlog(source);
    case "dynamic_portal":
      return scrapeDynamicPortal(source);
    default:
      return [];
  }
}

async function scrapeGenericBlog(source) {
  if (!source.selectors?.listing) return [];

  try {
    let html = await fetchHtmlRobust(source.url, { dynamic: false, timeout: 20000 });
    let items = extractListingsFromHtml(html, source);

    if (items.length === 0) {
      html = await fetchHtmlRobust(source.url, { dynamic: true, timeout: 45000 });
      items = extractListingsFromHtml(html, source);
    }

    if (items.length === 0) {
      console.warn(`[Scraper] ${source.name} → 0 listings`);
      return [];
    }

    const limited = items.slice(0, source.maxListings || 10);
    console.log(`[Scraper] ${source.name} → processing ${limited.length} articles`);

    const scholarships = [];
    for (const item of limited) {
      const { details, officialLink } = await fetchPageDetailsDeep(
        item.link,
        source.selectors.body || DEFAULT_BODY_SELECTOR,
        item.name,
        source.dynamicDetail || false,
        source,
      );

      const enriched = enrichDetails(details, item.name, source);
      const built = buildEligibilityString(enriched);

      // Always use article URL as unique DB key (official links repeat across posts)
      const record = buildScholarshipRecord({
        name: item.name,
        link: item.link,
        officialLink,
        source,
        details: enriched,
        built,
        titleHint: item.name,
      });

      scholarships.push(record);
      console.log(`  + ${item.name.substring(0, 48)}`);
      await delay(1000);
    }

    return scholarships;
  } catch (error) {
    console.error(`[Scraper] ${source.name} failed: ${error.message}`);
    return [];
  }
}

async function scrapeDynamicPortal(source) {
  const pages = source.pages?.length ? source.pages : [source.url];

  try {
    let combinedDetails = emptyDetails();
    let pageTitle = source.name;

    for (const pageUrl of pages) {
      const html = await fetchHtmlRobust(pageUrl, {
        dynamic: true,
        waitFor: source.waitFor,
        timeout: 45000,
      });

      const $ = cheerio.load(html);
      const title =
        $("h1").first().text().trim() || $("title").text().trim().split("|")[0].trim();
      if (title.length > 5) pageTitle = title;

      let details = extractDetailsFromHtml(
        html,
        source.selectors?.body || DEFAULT_BODY_SELECTOR,
        pageTitle,
      );

      for (const link of findEligibilityLinks(html, pageUrl)) {
        const extra = await fetchPageDetailsDeep(
          link,
          source.selectors?.body || DEFAULT_BODY_SELECTOR,
          pageTitle,
          true,
          source,
        );
        details = mergeExtractedDetails(details, extra.details);
        await delay(800);
      }

      combinedDetails = mergeExtractedDetails(combinedDetails, details);
    }

    const enriched = enrichDetails(combinedDetails, pageTitle, source);
    const built = buildEligibilityString(enriched);

    return [
      buildScholarshipRecord({
        name: pageTitle,
        link: source.url,
        officialLink: source.url,
        source,
        details: enriched,
        built,
        titleHint: pageTitle,
      }),
    ];
  } catch (error) {
    console.error(`[Scraper] ${source.name} failed: ${error.message}`);
    return [];
  }
}

function emptyDetails() {
  return {
    deadline: "Check official website",
    eligibility: "",
    cgpaText: "",
    ieltsText: "",
    minIELTS: null,
    ieltsExplicit: false,
    country: null,
    degreeLevel: null,
    field: null,
  };
}

async function fetchPageDetailsDeep(
  articleLink,
  bodySelector,
  titleHint = "",
  preferDynamic = false,
  source = {},
) {
  let officialLink = null;
  let details = emptyDetails();

  try {
    const html = await fetchHtmlRobust(articleLink, {
      dynamic: preferDynamic,
      timeout: preferDynamic ? 45000 : 20000,
    });

    details = extractDetailsFromHtml(html, bodySelector, titleHint);

    const officialLinks = findOfficialLinks(html, articleLink);
    if (officialLinks[0]) officialLink = officialLinks[0];

    for (const extraLink of [...findEligibilityLinks(html, articleLink), ...officialLinks]) {
      if (extraLink === articleLink) continue;
      try {
        const extraHtml = await fetchHtmlRobust(extraLink, {
          dynamic: preferDynamic,
          timeout: preferDynamic ? 45000 : 20000,
        });
        details = mergeExtractedDetails(
          details,
          extractDetailsFromHtml(extraHtml, bodySelector, titleHint),
        );
      } catch { /* skip */ }
      await delay(500);
    }
  } catch { /* return partial data */ }

  return { details: enrichDetails(details, titleHint, source), officialLink };
}

function enrichDetails(details, titleHint, source) {
  const combined = `${titleHint} ${details.eligibility || ""}`;

  if (!details.degreeLevel && source.degreeHint) details.degreeLevel = source.degreeHint;
  if (!details.degreeLevel) {
    const d = extractDegreeLevel(titleHint);
    if (d) details.degreeLevel = d;
  }
  if (!details.field) details.field = extractField(titleHint) || extractField(combined);
  if (!details.cgpaText) {
    const c = extractCGPA(combined);
    if (c) details.cgpaText = c;
  }
  if (!details.ieltsExplicit) {
    const ielts = extractIELTS(combined);
    if (ielts.explicit) {
      details.ieltsText = ielts.text;
      details.minIELTS = ielts.score;
      details.ieltsExplicit = true;
    }
  }

  return details;
}

function buildScholarshipRecord({
  name,
  link,
  officialLink,
  source,
  details,
  built,
  titleHint,
}) {
  let eligibility = built.eligibility;
  if (officialLink && officialLink !== link) {
    eligibility += ` | Official: ${officialLink}`;
  }

  return {
    name: name.trim(),
    link: link.trim(),
    country: details.country || extractCountry(titleHint) || source.country || "International",
    region: source.region || "USA/Europe",
    degreeLevel: details.degreeLevel || "Other",
    field: details.field || null,
    eligibility,
    minCGPA: built.minCGPA,
    minIELTS: built.minIELTS,
    deadline: details.deadline || "Check official website",
    source: source.name,
    scrapedAt: new Date(),
  };
}

async function saveToDatabase(scholarships) {
  let saved = 0, updated = 0, failed = 0;

  for (const scholarship of scholarships) {
    if (!scholarship.name || !scholarship.link) {
      failed++;
      continue;
    }

    try {
      const exists = await Scholarship.findOne({ link: scholarship.link });
      if (exists) {
        await Scholarship.updateOne({ link: scholarship.link }, { $set: scholarship });
        updated++;
      } else {
        await Scholarship.create(scholarship);
        saved++;
      }
    } catch (err) {
      failed++;
      console.error(`[DB] Failed: ${scholarship.name} — ${err.message}`);
    }
  }

  console.log(`[DB] New: ${saved} | Updated: ${updated} | Failed: ${failed}`);
}

async function runScraper() {
  console.log("\n========================================");
  console.log("[Scraper] Smart Scholarship Finder — data collection");
  console.log(`[Scraper] Tools: axios + cheerio + puppeteer`);
  console.log(`[Scraper] Sources: ${sources.length} (USA/Europe focus)`);
  console.log("========================================\n");

  let allScholarships = [];

  try {
    for (const source of sources) {
      const results = await scrapeSource(source);
      allScholarships = [...allScholarships, ...results];
      await delay(1000);
    }

    console.log(`\n[Scraper] Collected: ${allScholarships.length} records`);
    await saveToDatabase(allScholarships);
    console.log("[Scraper] Complete.\n");
  } catch (err) {
    console.error("[Scraper] Fatal error:", err.message);
  } finally {
    await closeBrowser();
  }
}

module.exports = { runScraper };
