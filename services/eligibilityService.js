// services/eligibilityService.js

function checkEligibility(student, scholarship) {

  let score = 0;
  let total = 0;

  // Degree
  if (scholarship.degreeLevel && student.degreeLevel) {
    total++;
    if (
      student.degreeLevel.toLowerCase() ===
      scholarship.degreeLevel.toLowerCase()
    ) score++;
  }

  // CGPA
  if (scholarship.minCGPA !== null && student.cgpa !== undefined) {
    total++;
    if (student.cgpa >= scholarship.minCGPA) score++;
  }

  // IELTS
  if (scholarship.minIELTS !== null && student.ielts !== undefined) {
    total++;
    if (student.ielts >= scholarship.minIELTS) score++;
  }

  // Field
  if (scholarship.field && student.field) {
    total++;
    if (
      scholarship.field.toLowerCase().includes(student.field.toLowerCase())
    ) score++;
  }

  if (total === 0) return "No Data";
  if (score === 0) return "Not Eligible";
  if (score === total) return "Eligible";

  return "Partially Eligible";
}

module.exports = { checkEligibility };