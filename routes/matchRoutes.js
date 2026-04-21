const express = require("express");
const router = express.Router();

const { matchScholarships } = require("../controllers/matchController");
const { protect } = require("../middleware/auth");

router.get("/match", protect, matchScholarships);

module.exports = router;
