// routes/eligibilityRoutes.js

const express = require("express");
const router = express.Router();
const {
  getEligibilityResults,
} = require("../controllers/eligibilityController");
const { protect } = require("../middleware/auth");

router.get("/", protect, getEligibilityResults);

module.exports = router;
