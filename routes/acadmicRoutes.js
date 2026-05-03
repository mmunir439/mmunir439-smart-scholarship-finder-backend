const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/auth");

const {
  createAcademicprofile,
  getAllAcademicProfiles,
  getMyAcademicProfile,
  updateMyAcademicProfile,
  deleteMyAcademicProfile,
} = require("../controllers/academicController");

// 🟢 USER ROUTES
router.post("/profile", protect, createAcademicprofile);
router.get("/profile", protect, getMyAcademicProfile);
router.put("/profile", protect, updateMyAcademicProfile);
router.delete("/profile", protect, deleteMyAcademicProfile);

// 🔐 ADMIN ROUTE
router.get("/profiles", protect, adminOnly, getAllAcademicProfiles);

module.exports = router;
