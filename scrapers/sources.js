// ─────────────────────────────────────────────────────────────
// SOURCES — scholarship data sources for the scraper
//
// Types:
//   generic_blog    → static HTML blog/aggregator (needs selectors)
//   static_fallback → JS-rendered or blocked portals (uses hardcoded fallback data)
//   daad            → DAAD Germany scraper strategy
//   stipendium_hungaricum → Stipendium Hungary scraper strategy
//   turkiye_burslari     → Turkish government scraper strategy
//   csc_china            → Chinese government scraper strategy
//
// To add a new source:
//   - If it's a static HTML blog, use generic_blog and add selectors
//   - If it's a JS-rendered official portal, use static_fallback with real data
// ─────────────────────────────────────────────────────────────

const sources = [
  // ─────────────── AGGREGATOR BLOGS (static HTML — cheerio works) ───────────────
  {
    name: "Scholars4Dev Masters",
    url: "https://www.scholars4dev.com/category/scholarships-by-level/masters-scholarships/",
    type: "generic_blog",
    country: "International",
    selectors: {
      listing: "article.post, .post",
      title: "h2.entry-title a, h1.entry-title a",
      link: "h2.entry-title a, h1.entry-title a",
      body: ".entry-content, .post-content",
    },
  },
  {
    name: "Scholars4Dev PhD",
    url: "https://www.scholars4dev.com/category/scholarships-by-level/phd-scholarships/",
    type: "generic_blog",
    country: "International",
    selectors: {
      listing: "article.post, .post",
      title: "h2.entry-title a, h1.entry-title a",
      link: "h2.entry-title a, h1.entry-title a",
      body: ".entry-content, .post-content",
    },
  },
  {
    name: "Scholars4Dev Bachelors",
    url: "https://www.scholars4dev.com/category/scholarships-by-level/undergraduate-scholarships/",
    type: "generic_blog",
    country: "International",
    selectors: {
      listing: "article.post, .post",
      title: "h2.entry-title a, h1.entry-title a",
      link: "h2.entry-title a, h1.entry-title a",
      body: ".entry-content, .post-content",
    },
  },
  {
    name: "Opportunitydesk",
    url: "https://opportunitydesk.org/category/scholarships/",
    type: "generic_blog",
    country: "International",
    selectors: {
      listing: "article, .post",
      title: "h2.entry-title a, h3.entry-title a",
      link: "h2.entry-title a, h3.entry-title a",
      body: ".entry-content, .post-content",
    },
  },
  {
    name: "ScholarshipRegion",
    url: "https://scholarshipregion.com/category/fully-funded-scholarships/",
    type: "generic_blog",
    country: "International",
    selectors: {
      listing: "article, .post",
      title: "h2 a, h3 a, .entry-title a",
      link: "h2 a, h3 a, .entry-title a",
      body: ".entry-content, article",
    },
  },

  // ─────────────── GERMANY ───────────────
  // DAAD uses JS rendering — static fallback with real data
  {
    name: "DAAD Germany",
    url: "https://www2.daad.de/deutschland/stipendium/datenbank/en/21148-scholarship-database/",
    type: "static_fallback",
    country: "Germany",
    fallback: {
      name: "DAAD Scholarship Program 2026",
      degreeLevel: "Master",
      field: "Engineering",
      eligibility:
        "CGPA 3.0+ | IELTS 6.5+ | Engineering or Sciences preferred | Strong academic record required",
      minCGPA: 3.0,
      minIELTS: 6.5,
      deadline: "October 31, 2025",
    },
  },

  // ─────────────── EUROPE ───────────────
  // Erasmus portal is JS-rendered — static fallback
  {
    name: "Erasmus Mundus",
    url: "https://www.eacea.ec.europa.eu/scholarships/erasmus-mundus-catalogue_en",
    type: "static_fallback",
    country: "Europe",
    fallback: {
      name: "Erasmus Mundus Joint Master Scholarships 2026",
      degreeLevel: "Master",
      field: "General",
      eligibility:
        "CGPA 3.0+ | IELTS 6.5+ | Open to all nationalities | Full tuition + monthly stipend",
      minCGPA: 3.0,
      minIELTS: 6.5,
      deadline: "January 15, 2026",
    },
  },
  {
    name: "Stipendium Hungaricum",
    url: "https://stipendiumhungaricum.hu/apply/",
    type: "static_fallback",
    country: "Hungary",
    fallback: {
      name: "Stipendium Hungaricum Scholarship 2026",
      degreeLevel: "Master",
      field: "General",
      eligibility:
        "CGPA 3.0+ | No IELTS required | Open to all fields | Full tuition + stipend + accommodation",
      minCGPA: 3.0,
      minIELTS: null,
      deadline: "January 15, 2026",
    },
  },

  // ─────────────── TURKEY ───────────────
  {
    name: "Türkiye Bursları",
    url: "https://www.turkiyeburslari.gov.tr/en",
    type: "static_fallback",
    country: "Turkey",
    fallback: {
      name: "Türkiye Bursları (Turkish Government Scholarship) 2026",
      degreeLevel: "Master",
      field: "General",
      eligibility:
        "CGPA 2.5+ | No IELTS required | Open to all fields | Full scholarship + monthly stipend",
      minCGPA: 2.5,
      minIELTS: null,
      deadline: "February 20, 2026",
    },
  },

  // ─────────────── CHINA ───────────────
  {
    name: "Chinese Government Scholarship (CSC)",
    url: "https://www.campuschina.org/",
    type: "static_fallback",
    country: "China",
    fallback: {
      name: "Chinese Government Scholarship (CSC) 2026",
      degreeLevel: "Master",
      field: "General",
      eligibility:
        "CGPA 2.8+ | No IELTS required for Chinese medium | Open to all fields | Full tuition + stipend",
      minCGPA: 2.8,
      minIELTS: null,
      deadline: "March 30, 2026",
    },
  },

  // ─────────────── JAPAN ───────────────
  {
    name: "MEXT Japan",
    url: "https://www.studyinjapan.go.jp/en/smap-stopj-applications-scholarship.html",
    type: "static_fallback",
    country: "Japan",
    fallback: {
      name: "MEXT Japanese Government Scholarship 2026",
      degreeLevel: "Master",
      field: "General",
      eligibility:
        "CGPA 3.0+ | No IELTS required | Open to all fields | Full tuition + monthly stipend + airfare",
      minCGPA: 3.0,
      minIELTS: null,
      deadline: "May 31, 2026",
    },
  },

  // ─────────────── SOUTH KOREA ───────────────
  {
    name: "KGSP South Korea",
    url: "https://www.studyinkorea.go.kr/",
    type: "static_fallback",
    country: "South Korea",
    fallback: {
      name: "Korean Government Scholarship Program (KGSP) 2026",
      degreeLevel: "Master",
      field: "General",
      eligibility:
        "CGPA 2.64+ (C+ or above) | No IELTS required | Korean language training included | Full scholarship",
      minCGPA: 2.64,
      minIELTS: null,
      deadline: "March 1, 2026",
    },
  },

  // ─────────────── AUSTRALIA ───────────────
  {
    name: "Australia Awards",
    url: "https://www.australiaawards.gov.au/",
    type: "static_fallback",
    country: "Australia",
    fallback: {
      name: "Australia Awards Scholarships 2026",
      degreeLevel: "Master",
      field: "General",
      eligibility:
        "CGPA 3.0+ | IELTS 6.5+ | Open to Pakistani nationals | Full tuition + living allowance",
      minCGPA: 3.0,
      minIELTS: 6.5,
      deadline: "April 30, 2026",
    },
  },

  // ─────────────── NEW ZEALAND ───────────────
  {
    name: "New Zealand Scholarships",
    url: "https://www.nzscholarships.govt.nz/",
    type: "static_fallback",
    country: "New Zealand",
    fallback: {
      name: "New Zealand Government Scholarships 2026",
      degreeLevel: "Master",
      field: "General",
      eligibility:
        "CGPA 3.0+ | IELTS 6.5+ | Development-focused fields preferred | Full tuition + living costs",
      minCGPA: 3.0,
      minIELTS: 6.5,
      deadline: "March 28, 2026",
    },
  },

  // ─────────────── USA ───────────────
  // Fastweb & Scholarships.com require JS — static fallbacks for key US programs
  {
    name: "Fulbright USA",
    url: "https://foreign.fulbrightonline.org/",
    type: "static_fallback",
    country: "USA",
    fallback: {
      name: "Fulbright Foreign Student Scholarship 2026",
      degreeLevel: "Master",
      field: "General",
      eligibility:
        "CGPA 3.0+ | IELTS 7.0+ | All academic fields | Full tuition + living stipend + airfare",
      minCGPA: 3.0,
      minIELTS: 7.0,
      deadline: "October 31, 2025",
    },
  },
  {
    name: "Hubert Humphrey Fellowship USA",
    url: "https://www.humphreyfellowship.org/",
    type: "static_fallback",
    country: "USA",
    fallback: {
      name: "Hubert Humphrey Fellowship Program 2026",
      degreeLevel: "Other",
      field: "Social Sciences",
      eligibility:
        "CGPA 3.0+ | IELTS 7.0+ | Mid-career professionals | Public service background required",
      minCGPA: 3.0,
      minIELTS: 7.0,
      deadline: "September 30, 2025",
    },
  },
];

module.exports = sources;
