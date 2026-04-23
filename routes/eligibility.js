const express = require("express");
const router = express.Router();
const AcademicInformation = require("../models/academic");
const Scholarship = require("../models/scholarship"); // make sure this exists
const { protect } = require("../middleware/auth");
// Route: POST /api/eligibility/check
router.get("/", protect, async (req, res) => {
  try {
    // 1. Get student profile
    const student = await AcademicInformation.findOne({
      userId: req.user._id,
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Academic profile not found",
      });
    }

    // 2. Get all scholarships
    const scholarships = await Scholarship.find();

    // 3. Apply decision logic
    const results = scholarships.map((s) => ({
      scholarship: s,
      status: checkEligibility(student, s),
    }));

    // 4. Sort results
    const sorted = results.sort((a, b) => {
      const order = {
        Eligible: 0,
        "Partially Eligible": 1,
        "Not Eligible": 2,
      };
      return order[a.status] - order[b.status];
    });

    res.json({ success: true, data: sorted });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Decision function
function checkEligibility(student, scholarship) {
  // Step 1: Degree level
  if (student.degreeLevel !== scholarship.degreeLevel) return "Not Eligible";

  // Step 2: CGPA
  if (student.cgpa < scholarship.minCGPA) return "Not Eligible";

  // Step 3: IELTS
  if (
    scholarship.requiresIELTS &&
    (!student.ielts || student.ielts < scholarship.minIELTS)
  )
    return "Partially Eligible";

  // Step 4: Fields — safely handle undefined/null/empty
  if (
    scholarship.fields?.length > 0 &&
    !scholarship.fields.includes(student.field)
  )
    return "Not Eligible";

  return "Eligible";
}
module.exports = router;
