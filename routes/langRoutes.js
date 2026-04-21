const express = require("express");
const router = express.Router();
const translations = require("../utils/translations");

const supportedLanguages = ["en", "ur", "so"];

// GET all translations
router.get("/:lang", (req, res) => {
  const lang = req.params.lang;

  if (!supportedLanguages.includes(lang)) {
    return res.status(400).json({
      success: false,
      message: "Language not supported",
    });
  }

  res.status(200).json({
    success: true,
    data: translations[lang],
  });
});

// GET single message
router.get("/message/:key", (req, res) => {
  const { key } = req.params;
  const lang = req.query.lang || "en";

  if (!supportedLanguages.includes(lang)) {
    return res.status(400).json({
      success: false,
      message: "Language not supported",
    });
  }

  const message = translations[lang][key];

  if (!message) {
    return res.status(404).json({
      success: false,
      message: "Translation key not found",
    });
  }

  res.status(200).json({
    success: true,
    message,
  });
});

module.exports = router; // ✅ THIS WAS MISSING
