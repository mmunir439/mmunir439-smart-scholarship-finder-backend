const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");

const Scholarship = require("../models/Scholarship");
const StudentProfile = require("../models/StudentProfile");
const checkEligibility = require("../utils/eligibility");

// ===============================
// 1. Scholarships by Country
// GET /api/stats/by-country
// ===============================
router.get("/by-country", protect, async (req, res) => {
  try {
    const stats = await Scholarship.aggregate([
      {
        $group: {
          _id: "$country",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          country: "$_id",
          count: 1,
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// ===============================
// 2. Scholarships by Degree Level
// GET /api/stats/by-degree
// ===============================
router.get("/by-degree", protect, async (req, res) => {
  try {
    const stats = await Scholarship.aggregate([
      { $unwind: "$degreeLevel" },
      {
        $group: {
          _id: "$degreeLevel",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          degreeLevel: "$_id",
          count: 1,
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// ===============================
// 3. Eligibility Summary
// GET /api/stats/eligibility-summary
// ===============================
router.get("/eligibility-summary", protect, async (req, res) => {
  try {
    // Get logged-in user's profile
    const profile = await StudentProfile.findOne({ userId: req.user.id });

    if (!profile) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    // Fetch all scholarships
    const scholarships = await Scholarship.find();

    let eligible = 0;
    let partiallyEligible = 0;
    let notEligible = 0;

    scholarships.forEach((scholarship) => {
      const result = checkEligibility(profile, scholarship);

      if (result === "Eligible") eligible++;
      else if (result === "Partially Eligible") partiallyEligible++;
      else notEligible++;
    });

    res.json({
      eligible,
      partiallyEligible,
      notEligible,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
