const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  getSettings,
  updateProfile,
  changePassword,
  updateAccessibility,
  updateNotifications,
  deleteAccount,
} = require("../controllers/settingsController");

router.get("/", protect, getSettings);                          // GET all settings
router.put("/profile", protect, updateProfile);                 // Update name
router.put("/change-password", protect, changePassword);        // Change password
router.put("/accessibility", protect, updateAccessibility);     // Language/TTS
router.put("/notifications", protect, updateNotifications);     // Notifications
router.delete("/delete-account", protect, deleteAccount);       // Delete account

module.exports = router;