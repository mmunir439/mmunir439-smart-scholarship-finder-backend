const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const academicController = require("../controllers/academic");
router.post("/", academicController);

module.exports = router;
