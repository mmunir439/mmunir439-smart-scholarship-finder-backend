const StudentProfile = require("../models/StudentProfile");
const Scholarship = require("../models/Scholarship");
const checkEligibility = require("../utils/eligibility");

exports.matchScholarships = async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({
      userId: req.user._id,
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Please complete your profile first",
      });
    }

    const scholarships = await Scholarship.find();

    const results = scholarships.map((sch) => {
      const status = checkEligibility(profile, sch);

      return {
        ...sch.toObject(),
        eligibilityStatus: status,
      };
    });

    // Sort results
    const order = {
      Eligible: 1,
      "Partially Eligible": 2,
      "Not Eligible": 3,
    };

    results.sort(
      (a, b) => order[a.eligibilityStatus] - order[b.eligibilityStatus],
    );

    res.status(200).json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
