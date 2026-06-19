const cheerio = require("cheerio");

function normaliseText(text) {
  return text
    .replace(/([A-Za-z])(\d)/g, "$1 $2")
    .replace(/(\d)([A-Za-z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();
}

function extractCountry(text) {
  const countries = [
    "USA", "United States", "UK", "United Kingdom", "Germany", "Australia",
    "Canada", "China", "Japan", "South Korea", "France", "Italy",
    "Netherlands", "Sweden", "Norway", "Turkey", "Malaysia", "UAE",
    "Saudi Arabia", "Pakistan", "Hungary", "New Zealand", "Europe",
  ];
  const lower = text.toLowerCase();
  for (const country of countries) {
    if (lower.includes(country.toLowerCase())) return country;
  }
  return null;
}

function extractDegreeLevel(text) {
  const lower = text.toLowerCase();

  if (/level\s+of\s+study|degree\s+level|study\s+level/i.test(lower)) {
    if (/master|msc|mba|postgraduate/i.test(lower)) return "Master";
    if (/bachelor|undergraduate/i.test(lower)) return "Bachelor";
    if (/ph\.?d|doctorate|doctoral/i.test(lower)) return "PhD";
  }

  if (/ph\.?d|doctorate|doctoral|research\s+degree/i.test(lower)) return "PhD";
  if (/postdoc|post-doc|postdoctoral/i.test(lower)) return "Postdoc";
  if (/master|msc|m\.sc|mba|postgraduate|graduate\s+program|ma\s+degree/i.test(lower))
    return "Master";
  if (/bachelor|undergraduate|b\.?s\.?|ba\s+degree|first\s+degree/i.test(lower))
    return "Bachelor";
  return null;
}

function extractField(text) {
  const lower = text.toLowerCase();
  if (/open to all|all fields|any field|all discipline|all subjects|all areas of study/i.test(lower))
    return "General";
  if (/engineer|stem|technology/i.test(lower)) return "Engineering";
  if (/business|mba|management|economics|finance/i.test(lower)) return "Business";
  if (/medicine|medical|health|nursing|pharmacy/i.test(lower)) return "Medicine";
  if (/computer|software|information technology|data science|cyber/i.test(lower))
    return "Computer Science";
  if (/law|legal/i.test(lower)) return "Law";
  if (/art|design|creative|humanities/i.test(lower)) return "Arts";
  if (/agriculture|agri/i.test(lower)) return "Agriculture";
  if (/science|physics|chemistry|biology|mathematics/i.test(lower)) return "Sciences";
  if (/social science|sociology|psychology|development studies/i.test(lower))
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
  return null;
}

function toeflToIelts(toeflScore) {
  const map = [
    [118, 9.0], [115, 8.5], [110, 8.0], [102, 7.5], [94, 7.0],
    [79, 6.5], [60, 6.0], [50, 5.5], [35, 5.0],
  ];
  for (const [toefl, ielts] of map) {
    if (toeflScore >= toefl) return ielts;
  }
  return null;
}

function extractCGPA(text) {
  const patterns = [
    /(?:minimum\s+)?(?:cgpa|gpa|cumulative\s+grade\s+point\s+average)[:\-\s]*(?:of\s+)?(\d+\.?\d*)/i,
    /(?:cgpa|gpa)\s+of\s+(\d+\.?\d*)/i,
    /(\d+\.?\d*)\s*(?:\/\s*4(?:\.0)?)?\s*(?:cgpa|gpa)/i,
    /(?:at\s+least|minimum\s+of|not\s+less\s+than)\s+(\d+\.?\d*)\s*(?:cgpa|gpa|grade\s+point)/i,
    /grade\s+point\s+average\s+(?:of\s+)?(?:at\s+least\s+)?(\d+\.?\d*)/i,
    /academic\s+(?:average|record|standing)[:\s]+(?:minimum\s+)?(\d+\.?\d*)/i,
    /(?:minimum|at\s+least)\s+(\d{2,3})\s*%/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (!match) continue;
    const val = parseFloat(match[1]);
    if (val > 10) return `CGPA ${(val / 25).toFixed(2)}+`;
    if (val >= 2 && val <= 4) return `CGPA ${val}+`;
  }
  return "";
}

function extractIELTS(text) {
  if (/no\s+ielts|ielts\s+(?:not\s+)?required|without\s+ielts|ielts\s+exempt|ielts\s+waived/i.test(text)) {
    return { text: "No IELTS required", score: 0, explicit: true };
  }

  const patterns = [
    /ielts[:\-\s]*(?:score\s*(?:of\s*)?|band\s*(?:of\s*)?|minimum\s*(?:of\s*)?)?(\d+\.?\d*)/i,
    /(\d+\.?\d*)\s*(?:or\s+above\s+)?(?:in\s+)?ielts/i,
    /english\s+(?:proficiency|language|test)[:\-\s]*(?:ielts\s*)?(\d+\.?\d*)/i,
    /ielts\s+(?:academic\s+)?(?:minimum\s+)?(?:band\s+)?(\d+\.?\d*)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return { text: `IELTS ${match[1]}+`, score: parseFloat(match[1]), explicit: true };
    }
  }

  const toeflMatch = text.match(/toefl[:\-\s]*(?:ibt\s*)?(?:score\s*)?(?:of\s+)?(?:at\s+least\s+)?(\d{2,3})/i);
  if (toeflMatch) {
    const ielts = toeflToIelts(parseInt(toeflMatch[1], 10));
    if (ielts) {
      return { text: `IELTS ${ielts}+ (from TOEFL ${toeflMatch[1]})`, score: ielts, explicit: true };
    }
  }

  const pteMatch = text.match(/pte[:\-\s]*(?:score\s*)?(?:of\s+)?(?:at\s+least\s+)?(\d{2})/i);
  if (pteMatch) {
    const pte = parseInt(pteMatch[1], 10);
    if (pte >= 65) {
      return { text: `IELTS 6.5+ (from PTE ${pte})`, score: 6.5, explicit: true };
    }
    if (pte >= 58) {
      return { text: `IELTS 6.0+ (from PTE ${pte})`, score: 6.0, explicit: true };
    }
  }

  return { text: "", score: null, explicit: false };
}

function extractEligibility(text) {
  const match = text.match(/eligibilit(?:y|ies)[:\-\s]+([^.]{10,}\.)/i);
  if (match) return match[1].trim().substring(0, 300);
  return "";
}

function parseNumericRequirements(cgpaText, ieltsResult) {
  let minCGPA = null;
  let minIELTS = null;

  if (cgpaText) {
    const cgpaMatch = cgpaText.match(/(\d+\.?\d*)/);
    if (cgpaMatch) minCGPA = parseFloat(cgpaMatch[1]);
  }

  if (ieltsResult?.score !== null && ieltsResult?.score !== undefined) {
    minIELTS = ieltsResult.score;
  }

  return { minCGPA, minIELTS };
}

function buildEligibilityString(details) {
  const parts = [];
  if (details.cgpaText) parts.push(details.cgpaText);
  if (details.ieltsText) parts.push(details.ieltsText);
  if (
    details.eligibility &&
    details.eligibility !== "Visit official website for full eligibility details"
  ) {
    parts.push(details.eligibility);
  }

  const eligibility =
    parts.length > 0
      ? parts.join(" | ")
      : "Visit official website for full eligibility details";

  const { minCGPA, minIELTS } = parseNumericRequirements(
    details.cgpaText,
    { score: details.minIELTS, text: details.ieltsText },
  );

  return { eligibility, minCGPA, minIELTS };
}

function extractScholarshipSummary(text) {
  const result = { degreeLevel: null, field: null, cgpaText: "", ieltsText: "", minIELTS: null, ieltsExplicit: false };

  const levelMatch = text.match(
    /level\s+of\s+study[:\s]+([^|\n]+?)(?:institution|study\s+in|courses\s+offered|deadline|eligib|$)/i,
  );
  if (levelMatch) {
    result.degreeLevel = extractDegreeLevel(levelMatch[1]);
  }

  const fieldMatch = text.match(
    /(?:courses?\s+offered|field\s+of\s+study|study\s+programs?)[:\s]+([^|\n]+?)(?:deadline|eligib|benefit|coverage|how\s+to|$)/i,
  );
  if (fieldMatch) {
    result.field = extractField(fieldMatch[1]) || (/all|any|open/i.test(fieldMatch[1]) ? "General" : null);
  }

  const cgpaMatch = text.match(/(?:minimum\s+)?(?:cgpa|gpa)[:\s]+(\d+\.?\d*)/i);
  if (cgpaMatch) result.cgpaText = `CGPA ${cgpaMatch[1]}+`;

  const ieltsMatch = text.match(/ielts[:\s]+(\d+\.?\d*)/i);
  if (ieltsMatch) {
    result.ieltsText = `IELTS ${ieltsMatch[1]}+`;
    result.minIELTS = parseFloat(ieltsMatch[1]);
    result.ieltsExplicit = true;
  }

  return result;
}

function getBodyText($, bodySelector) {
  const selectors = bodySelector
    ? bodySelector.split(",").map((s) => s.trim())
    : [".entry-content", ".post-content", "main", "article", "#content", "body"];

  let bodyText = "";
  for (const sel of selectors) {
    const found = $(sel).text().trim();
    if (found.length > bodyText.length) bodyText = found;
  }
  if (!bodyText) bodyText = $("body").text();
  return normaliseText(bodyText);
}

function extractStructuredSnippets($) {
  const snippets = [];

  $("table tr").each((_, row) => {
    const cells = $(row).find("td, th").map((_, c) => $(c).text().trim()).get();
    if (cells.length >= 2) snippets.push(`${cells[0]}: ${cells[1]}`);
  });

  $("dl").each((_, dl) => {
    $(dl).find("dt").each((_, dt) => {
      const key = $(dt).text().trim();
      const val = $(dt).next("dd").text().trim();
      if (key && val) snippets.push(`${key}: ${val}`);
    });
  });

  $("li").each((_, li) => {
    const t = $(li).text().trim();
    if (t.length > 10 && t.length < 400) snippets.push(t);
  });

  $("p, div").each((_, el) => {
    const t = $(el).text().trim();
    if (/cgpa|gpa|ielts|toefl|english|degree|bachelor|master|phd|field|discipline/i.test(t) && t.length < 500) {
      snippets.push(t);
    }
  });

  return snippets.join(" | ");
}

function extractDetailsFromHtml(html, bodySelector, titleHint = "") {
  const $ = cheerio.load(html);
  const normalised = getBodyText($, bodySelector);
  const structured = extractStructuredSnippets($);
  const combinedText = `${titleHint} | ${normalised} | ${structured}`;
  const summary = extractScholarshipSummary(combinedText);

  let eligibilityBullets = [];
  $("h1, h2, h3, h4, strong, b, td, th").each((_, el) => {
    const headingText = $(el).text().trim().toLowerCase();
    if (/eligib|criteria|requirement|academic|qualification/.test(headingText)) {
      $(el).next("ul, ol").add($(el).parent().next("ul, ol")).find("li").each((_, li) => {
        const t = $(li).text().trim();
        if (t.length > 3) eligibilityBullets.push(t);
      });
      const nextPara = $(el).next("p, div").first().text().trim();
      if (nextPara.length > 10) eligibilityBullets.push(nextPara);
    }
  });

  const bulletText = eligibilityBullets.join(" ");
  const cgpaText =
    summary.cgpaText ||
    extractCGPA(combinedText) ||
    extractCGPA(bulletText);

  const ieltsFromText = extractIELTS(combinedText).explicit
    ? extractIELTS(combinedText)
    : extractIELTS(bulletText);

  const ieltsResult = summary.ieltsExplicit
    ? { text: summary.ieltsText, score: summary.minIELTS, explicit: true }
    : ieltsFromText;

  const deadline = extractDeadline(combinedText);
  const degreeLevel =
    summary.degreeLevel ||
    extractDegreeLevel(titleHint) ||
    extractDegreeLevel(bulletText) ||
    extractDegreeLevel(eligibilityBullets.join(" "));

  const field =
    summary.field ||
    extractField(titleHint) ||
    extractField(bulletText) ||
    extractField(eligibilityBullets.join(" "));

  let eligibility = "";
  if (eligibilityBullets.length > 0) {
    eligibility = eligibilityBullets.slice(0, 5).join(" | ").substring(0, 400);
  } else {
    eligibility = extractEligibility(combinedText);
  }

  return {
    deadline: deadline || "Check official website",
    eligibility: eligibility || "Visit official website for full eligibility details",
    cgpaText,
    ieltsText: ieltsResult.text,
    minIELTS: ieltsResult.score,
    ieltsExplicit: ieltsResult.explicit,
    cgpaExplicit: !!cgpaText,
    country: extractCountry(combinedText),
    degreeLevel,
    degreeExplicit: !!degreeLevel,
    field,
    fieldExplicit: !!field,
  };
}

function mergeExtractedDetails(base, incoming) {
  return {
    deadline: base.deadline !== "Check official website" ? base.deadline : incoming.deadline,
    eligibility:
      incoming.eligibility?.length > (base.eligibility?.length || 0) &&
      incoming.eligibility !== "Visit official website for full eligibility details"
        ? incoming.eligibility
        : base.eligibility || incoming.eligibility,
    cgpaText: base.cgpaText || incoming.cgpaText,
    ieltsText: base.ieltsText || incoming.ieltsText,
    minIELTS: base.minIELTS !== null && base.minIELTS !== undefined ? base.minIELTS : incoming.minIELTS,
    ieltsExplicit: base.ieltsExplicit || incoming.ieltsExplicit,
    cgpaExplicit: base.cgpaExplicit || incoming.cgpaExplicit,
    country: base.country || incoming.country,
    degreeLevel: base.degreeLevel || incoming.degreeLevel,
    degreeExplicit: base.degreeExplicit || incoming.degreeExplicit,
    field: base.field || incoming.field,
    fieldExplicit: base.fieldExplicit || incoming.fieldExplicit,
  };
}

function findEligibilityLinks(html, baseUrl) {
  const $ = cheerio.load(html);
  const links = new Set();

  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    const text = $(el).text().trim().toLowerCase();
    if (!href || href.startsWith("#") || href.startsWith("mailto:")) return;
    if (/eligib|requirement|criteria|qualification|how to apply|admission|apply now|application/.test(text)) {
      try {
        const full = href.startsWith("http") ? href : new URL(href, baseUrl).href;
        if (full.startsWith("http")) links.add(full);
      } catch { /* skip bad URLs */ }
    }
  });

  return [...links].slice(0, 4);
}

function findOfficialLinks(html, baseUrl) {
  const $ = cheerio.load(html);
  const links = new Set();

  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    const text = $(el).text().trim().toLowerCase();
    if (!href || href.startsWith("#") || href.startsWith("mailto:")) return;
    if (
      /official website|apply here|application portal|apply online|visit website|scholarship page|learn more/.test(text) ||
      /apply|admission/.test(text) && text.length < 40
    ) {
      try {
        const full = href.startsWith("http") ? href : new URL(href, baseUrl).href;
        if (full.startsWith("http") && !full.includes("facebook") && !full.includes("twitter")) {
          links.add(full);
        }
      } catch { /* skip */ }
    }
  });

  return [...links].slice(0, 2);
}

function hasRequiredFields(record, minRequired = 2) {
  const found = [];
  if (record.minCGPA !== null && record.minCGPA > 0) found.push("CGPA");
  if (record.minIELTS !== null && record.minIELTS !== undefined) found.push("IELTS");
  if (record.degreeLevel && record.degreeLevel !== "Other") found.push("degree");
  if (record.field) found.push("field");

  const all = ["CGPA", "IELTS", "degree", "field"];
  const missing = all.filter((f) => !found.includes(f));

  return {
    valid: found.length >= minRequired,
    found,
    missing,
    count: found.length,
  };
}

function extractListingsFromHtml(html, source) {
  const $ = cheerio.load(html);
  const items = [];
  if (!source.selectors?.listing) return items;

  $(source.selectors.listing).each((_, el) => {
    const name = $(el).find(source.selectors.title).first().text().trim();
    const rawLink = $(el).find(source.selectors.link).first().attr("href");
    let link = rawLink;
    if (link && !link.startsWith("http")) {
      const base = new URL(source.url);
      link = `${base.origin}${link.startsWith("/") ? "" : "/"}${link}`;
    }
    if (!name || name.length < 5 || !link) return;
    items.push({ name, link });
  });

  return items;
}

module.exports = {
  extractCountry,
  extractDegreeLevel,
  extractField,
  extractDeadline,
  extractCGPA,
  extractIELTS,
  extractEligibility,
  buildEligibilityString,
  parseNumericRequirements,
  extractDetailsFromHtml,
  extractListingsFromHtml,
  mergeExtractedDetails,
  findEligibilityLinks,
  findOfficialLinks,
  hasRequiredFields,
  normaliseText,
};
