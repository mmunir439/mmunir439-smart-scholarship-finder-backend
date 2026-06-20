const EUROPE_COUNTRIES = [
  "Germany",
  "UK",
  "France",
  "Netherlands",
  "Hungary",
];

const STUDY_REGIONS = ["USA & Europe", "USA only", "Europe only"];
const PREFERRED_DEGREES = ["All", "Bachelor", "Master", "PhD"];

function inferRegion(scholarship) {
  if (scholarship.region) return scholarship.region;

  const country = scholarship.country || "";
  const source = scholarship.source || "";
  const name = scholarship.name || "";

  if (country === "USA") return "USA";
  if (EUROPE_COUNTRIES.includes(country)) return "Europe";
  if (/usa/i.test(source) || /usa/i.test(name)) return "USA";
  if (/germany|uk|france|netherlands|hungary|europe/i.test(source + name)) {
    return "Europe";
  }

  return "USA/Europe";
}

function matchesStudyRegion(scholarship, studyRegion) {
  if (!studyRegion || studyRegion === "USA & Europe") return true;

  const region = inferRegion(scholarship);
  const country = scholarship.country || "";
  const source = scholarship.source || "";
  const name = scholarship.name || "";
  const isInternational = country === "International";

  if (studyRegion === "USA only") {
    return (
      region === "USA" ||
      region === "USA/Europe" ||
      country === "USA" ||
      isInternational ||
      /usa/i.test(source) ||
      /usa/i.test(name)
    );
  }

  if (studyRegion === "Europe only") {
    return (
      region === "Europe" ||
      region === "USA/Europe" ||
      EUROPE_COUNTRIES.includes(country) ||
      isInternational ||
      /germany|uk|france|netherlands|hungary|europe/i.test(source + name)
    );
  }

  return true;
}

function matchesPreferredDegree(scholarship, preferredDegree) {
  if (!preferredDegree || preferredDegree === "All") return true;

  const level = scholarship.degreeLevel || "Other";
  if (level === "Other") return true;

  return level === preferredDegree;
}

function filterScholarships(scholarships, { studyRegion, preferredDegree } = {}) {
  return scholarships.filter(
    (s) =>
      matchesStudyRegion(s, studyRegion) &&
      matchesPreferredDegree(s, preferredDegree),
  );
}

module.exports = {
  STUDY_REGIONS,
  PREFERRED_DEGREES,
  EUROPE_COUNTRIES,
  inferRegion,
  matchesStudyRegion,
  matchesPreferredDegree,
  filterScholarships,
};
