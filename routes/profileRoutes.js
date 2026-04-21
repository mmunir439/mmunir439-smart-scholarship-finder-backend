const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  createOrUpdateProfile,
  getProfile,
} = require("../controllers/profileController");
router.post("/profielRegister", protect, createOrUpdateProfile);
router.get("/getProfile", protect, getProfile);

module.exports = router;
