const express = require("express");
const router = express.Router();

const {
  getScholarships,
  getScholarshipById,
  createScholarship,
  updateScholarship,
  deleteScholarship,
} = require("../controllers/scholarshipController");

// ✅ FIX IMPORT
const { protect, adminOnly } = require("../middleware/auth");

// Public
router.get("/scholarships", getScholarships);
router.get("/scholarships/:id", getScholarshipById);

// Admin
router.post("/scholarships", protect, adminOnly, createScholarship);
router.put("/scholarships/:id", protect, adminOnly, updateScholarship);
router.delete("/scholarships/:id", protect, adminOnly, deleteScholarship);

module.exports = router;
