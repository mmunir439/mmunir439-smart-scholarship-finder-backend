/**
 * FYP-aligned scholarship sources — USA & Europe focus
 * Scraping: axios + cheerio (static blogs), puppeteer (dynamic portals)
 */
const S4D_BODY = ".col-lg-8, .page-section, .card-body, .accordion, .entry-content";
const S4D_LISTING = {
  listing: ".post",
  title: "h2 a, h1 a, .entry-title a",
  link: "h2 a, h1 a, .entry-title a",
  body: S4D_BODY,
};

const sources = [
  // ── Degree levels (Bachelor / Master / PhD) ──
  {
    name: "Scholars4Dev Masters",
    url: "https://www.scholars4dev.com/category/scholarships-by-level/masters-scholarships/",
    type: "generic_blog",
    country: "International",
    region: "USA/Europe",
    degreeHint: "Master",
    maxListings: 10,
    selectors: S4D_LISTING,
  },
  {
    name: "Scholars4Dev PhD",
    url: "https://www.scholars4dev.com/category/scholarships-by-level/phd-scholarships/",
    type: "generic_blog",
    country: "International",
    region: "USA/Europe",
    degreeHint: "PhD",
    maxListings: 10,
    selectors: S4D_LISTING,
  },
  {
    name: "Scholars4Dev Bachelors",
    url: "https://www.scholars4dev.com/category/scholarships-by-level/undergraduate-scholarships/",
    type: "generic_blog",
    country: "International",
    region: "USA/Europe",
    degreeHint: "Bachelor",
    maxListings: 10,
    selectors: S4D_LISTING,
  },

  // ── USA ──
  {
    name: "Scholars4Dev USA",
    url: "https://www.scholars4dev.com/category/country/usa/",
    type: "generic_blog",
    country: "USA",
    region: "USA",
    maxListings: 10,
    selectors: S4D_LISTING,
  },

  // ── Europe ──
  {
    name: "Scholars4Dev Germany",
    url: "https://www.scholars4dev.com/category/country/germany/",
    type: "generic_blog",
    country: "Germany",
    region: "Europe",
    maxListings: 10,
    selectors: S4D_LISTING,
  },
  {
    name: "Scholars4Dev UK",
    url: "https://www.scholars4dev.com/category/country/uk/",
    type: "generic_blog",
    country: "UK",
    region: "Europe",
    maxListings: 10,
    selectors: S4D_LISTING,
  },
  {
    name: "Scholars4Dev France",
    url: "https://www.scholars4dev.com/category/country/france/",
    type: "generic_blog",
    country: "France",
    region: "Europe",
    maxListings: 8,
    selectors: S4D_LISTING,
  },
  {
    name: "Scholars4Dev Netherlands",
    url: "https://www.scholars4dev.com/category/country/netherlands/",
    type: "generic_blog",
    country: "Netherlands",
    region: "Europe",
    maxListings: 8,
    selectors: S4D_LISTING,
  },
  {
    name: "Scholars4Dev Hungary",
    url: "https://www.scholars4dev.com/category/country/hungary/",
    type: "generic_blog",
    country: "Hungary",
    region: "Europe",
    maxListings: 8,
    selectors: S4D_LISTING,
  },

  // ── Aggregators (structured eligibility text) ──
  {
    name: "ScholarshipRoar",
    url: "https://scholarshiproar.com/category/scholarships/",
    type: "generic_blog",
    country: "International",
    region: "USA/Europe",
    maxListings: 12,
    selectors: {
      listing: "article, .post",
      title: "h2 a, .entry-title a",
      link: "h2 a, .entry-title a",
      body: ".entry-content, .post-content, article",
    },
  },
  {
    name: "Opportunitydesk Scholarships",
    url: "https://opportunitydesk.org/",
    type: "generic_blog",
    country: "International",
    region: "USA/Europe",
    maxListings: 10,
    selectors: {
      listing: "article, .post, .type-post",
      title: "h2 a, h3 a, .entry-title a",
      link: "h2 a, h3 a, .entry-title a",
      body: ".entry-content, .post-content, article, main",
    },
  },

  // ── Official portals (puppeteer) ──
  {
    name: "Stipendium Hungaricum Europe",
    url: "https://stipendiumhungaricum.hu/apply/",
    type: "dynamic_portal",
    country: "Hungary",
    region: "Europe",
    waitFor: "body",
    pages: ["https://stipendiumhungaricum.hu/apply/"],
    selectors: { body: "main, .content, article, #content, body" },
  },
];

module.exports = sources;
