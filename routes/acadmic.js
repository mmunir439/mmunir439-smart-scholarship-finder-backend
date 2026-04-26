const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/auth");
const {
  createAcademicprofile,
  getAllAcademicProfiles,
  getMyAcademicProfile,
  updateMyAcademicProfile,
  deleteMyAcademicProfile,
} = require("../controllers/academic");
router.post("/add", protect, createAcademicprofile);

router.get("/all", getAllAcademicProfiles);

router.get("/single", protect, getMyAcademicProfile);

router.put("/edit", protect, updateMyAcademicProfile);

router.delete("/delete", protect, deleteMyAcademicProfile);

module.exports = router;
