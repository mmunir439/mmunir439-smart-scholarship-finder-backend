// controllers/eligibilityController.js

const Scholarship = require("../models/scholarshipModel");
const UserProfile = require("../models/scholarshipModel.js");
const AcademicInformation = require("../models/academicModel.js");
const { checkEligibility } = require("../services/eligibilityService");

const getEligibilityResults = async (req, res) => {
  try {
    const userId = req.user._id; // from JWT

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
      status: checkEligibility(student, s),
    }));

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getEligibilityResults };
