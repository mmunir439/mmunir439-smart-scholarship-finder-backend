const express = require("express");
const router = express.Router();
const {
  getScholarships,
  deleteScholarship,
  updateScholarship,
  createScholarship,
  getScholarshipById,
} = require("../controllers/scholarshipController");

// ─────────────────────────────────────────────
// GET /api/scholarships
// Returns ALL scholarships from MongoDB
// Frontend calls this to show the full list
// ─────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const scholarships = await Scholarship.find().sort({ scrapedAt: -1 });
    res.json({ success: true, count: scholarships.length, data: scholarships });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────
// GET /api/scholarships/:id
// Returns ONE scholarship by its MongoDB ID
// ─────────────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const scholarship = await Scholarship.findById(req.params.id);
    if (!scholarship) {
      return res
        .status(404)
        .json({ success: false, message: "Scholarship not found" });
    }
    res.json({ success: true, data: scholarship });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────
// GET /api/scholarships/filter/search
// Filter scholarships by degree level and country
// Example: /api/scholarships/filter/search?degreeLevel=Masters&country=Germany
// This is what the decision tree results page will use
// ─────────────────────────────────────────────
router.get("/filter/search", async (req, res) => {
  try {
    const { degreeLevel, country, field } = req.query;

    // Build filter object dynamically
    const filter = {};
    if (degreeLevel)
      filter.degreeLevel = { $regex: degreeLevel, $options: "i" };
    if (country) filter.country = { $regex: country, $options: "i" };
    if (field) filter.field = { $regex: field, $options: "i" };

    const scholarships = await Scholarship.find(filter).sort({ scrapedAt: -1 });
    res.json({ success: true, count: scholarships.length, data: scholarships });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────
// GET /api/scholarships/stats/overview
// Returns stats for Chart.js on the frontend
// Shows: count by country, count by degree level
// ─────────────────────────────────────────────
router.get("/stats/overview", async (req, res) => {
  try {
    // Count scholarships grouped by country
    const byCountry = await Scholarship.aggregate([
      { $group: { _id: "$country", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Count scholarships grouped by degree level
    const byDegree = await Scholarship.aggregate([
      { $group: { _id: "$degreeLevel", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      success: true,
      data: { byCountry, byDegree },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
