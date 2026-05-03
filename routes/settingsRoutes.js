const express = require("express");
const router = express.Router();

const Settings = require("../models/SettingsModel");
const { protect, adminOnly } = require("../middleware/auth");

// ================= GET SETTINGS =================
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    let settings = await Settings.findOne();

    // If no settings exist, create default
    if (!settings) {
      settings = await Settings.create({});
    }

    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ================= UPDATE GENERAL =================
router.put("/general", protect, adminOnly, async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "No data provided" });
    }

    const settings = await Settings.findOneAndUpdate(
      {},
      { $set: req.body }, // 👈 IMPORTANT FIX
      { new: true, upsert: true },
    );

    res.json({
      message: "General settings updated",
      settings,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});
// ================= UPDATE SCRAPER =================
router.put("/scraper", protect, adminOnly, async (req, res) => {
  try {
    const settings = await Settings.findOneAndUpdate(
      {},
      { scraper: req.body },
      { new: true, upsert: true },
    );

    res.json({ message: "Scraper updated", settings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ================= UPDATE DECISION =================
router.put("/decision", protect, adminOnly, async (req, res) => {
  try {
    const settings = await Settings.findOneAndUpdate(
      {},
      {
        decisionRules: req.body.decisionRules,
        eligibilityLogic: req.body.eligibilityLogic,
      },
      { new: true, upsert: true },
    );

    res.json({ message: "Decision rules updated", settings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ================= UPDATE ACCOUNT =================
router.put("/account", protect, adminOnly, async (req, res) => {
  try {
    const { name, email } = req.body;

    req.user.name = name;
    req.user.email = email;

    await req.user.save();

    res.json({ message: "Profile updated", user: req.user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
