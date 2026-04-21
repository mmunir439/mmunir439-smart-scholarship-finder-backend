const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth")
const {
  createScholarship,
  getAllScholarships,
  checkEligibility,
} = require("../controllers/scholarship");

router.post("/add", createScholarship);
router.get("/", getAllScholarships);
router.get("/checkEligibility", authMiddleware, checkEligibility);
router.get("/scrapeScholarships", authMiddleware, scrapeScholarships);

module.exports = router;
