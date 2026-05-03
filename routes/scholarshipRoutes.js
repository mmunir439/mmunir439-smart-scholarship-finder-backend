const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/auth");
const {
  getAllScholarships,
  getScholarships,
  getScholarshipById,
  createScholarship,
  updateScholarship,
  deleteScholarship,
} = require("../controllers/scholarshipController");

// Example routes (you said you'll do later)
router.get("/", getScholarships);
router.get("/all", getAllScholarships);
router.get("/:id", getScholarshipById);
router.post("/create", protect, adminOnly, createScholarship);
router.put("/update/:id", protect, adminOnly, updateScholarship);
router.delete("/delete/:id", protect, adminOnly, deleteScholarship);

module.exports = router;
