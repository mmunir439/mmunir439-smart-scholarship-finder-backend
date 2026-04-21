const checkEligibility = (profile, scholarship) => {

  // 1. Degree mismatch
  if (!scholarship.degreeLevel.includes(profile.degreeLevel)) {
    return 'Not Eligible';
  }

  // 2. CGPA check
  if (profile.cgpa < scholarship.minCGPA) {
    return 'Not Eligible';
  }

  // 3. IELTS check
  if (profile.ieltsScore < scholarship.minIELTS) {
    return 'Partially Eligible';
  }

  // 4. Field check
  if (
    scholarship.fieldOfStudy.length > 0 &&
    !scholarship.fieldOfStudy.includes(profile.fieldOfStudy)
  ) {
    return 'Partially Eligible';
  }

  // 5. All good
  return 'Eligible';
};

module.exports = checkEligibility;