const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const academicinformation = require("../controllers/academicinformation");
router.post("/academicinformation", protect, academicinformation);

module.exports = router;
