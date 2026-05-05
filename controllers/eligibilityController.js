// controllers/eligibilityController.js
const { formatEligibilityText } = require("../utils/ttsHelper"); // ← already imported ✅
const Scholarship = require("../models/scholarshipModel");
const AcademicInformation = require("../models/academicModel.js");
const { checkEligibility } = require("../services/eligibilityService");

const getEligibilityResults = async (req, res) => {
  try {
    const userId = req.user._id;

    const student = await AcademicInformation.findOne({ userId });
    if (!student) {
      return res.status(404).json({ message: "Profile not found" });
    }

    const scholarships = await Scholarship.find();

    const results = scholarships.map((s) => ({
      name: s.name,
      country: s.country,
      degreeLevel: s.degreeLevel,
      deadline: s.deadline,
      link: s.link,
      source: s.source,
      cgpa: s.minCGPA,
      ielts: s.minIELTS,
      status: checkEligibility(student, s),
    }));

    // ✅ ONLY CHANGE: wrap results and add ttsText
    res.json({
      results,
      ttsText: formatEligibilityText(results),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getEligibilityResults };
