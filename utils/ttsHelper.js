// backend/utils/ttsHelper.js

const formatEligibilityText = (results) => {
  if (!results || results.length === 0) {
    return "No eligibility results found.";
  }

  const eligible = results.filter((r) => r.status === "Eligible");
  const partial = results.filter((r) => r.status === "Partially Eligible");

  if (eligible.length > 0) {
    const names = eligible.map((r) => r.name).join(", ");
    return `Congratulations! You are fully eligible for ${eligible.length} scholarship${eligible.length !== 1 ? "s" : ""}: ${names}.`;
  } else if (partial.length > 0) {
    const names = partial.map((r) => r.name).join(", ");
    return `You are partially eligible for ${partial.length} scholarship${partial.length !== 1 ? "s" : ""}: ${names}. Consider improving your CGPA or IELTS score.`;
  } else {
    return "Unfortunately you are not eligible for any scholarships at this time. Try improving your academic profile.";
  }
};

const formatScholarshipText = (scholarship) => {
  if (!scholarship) return "Scholarship details not available.";
  const { name, country, deadline, degreeLevel } = scholarship;
  return `Scholarship: ${name || "Unknown"}. Country: ${country || "Unknown"}. Degree Level: ${degreeLevel || "Not specified"}. Deadline: ${deadline || "Not specified"}.`;
};

module.exports = { formatEligibilityText, formatScholarshipText };
