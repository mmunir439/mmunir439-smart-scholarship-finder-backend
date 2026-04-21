const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { updateLanguage } = require("../controllers/profileController");
const {
  createOrUpdateProfile,
  getProfile,
} = require("../controllers/profileController");
router.post("/profielRegister", protect, createOrUpdateProfile);
router.get("/getProfile", protect, getProfile);

router.put("/profile/language", protect, updateLanguage);

module.exports = router;
