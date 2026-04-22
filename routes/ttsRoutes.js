const express = require("express");
const router = express.Router();
const gTTS = require("gtts");
const path = require("path");
const fs = require("fs");
const { protect } = require("../middleware/auth");
router.post("/tts/speak", protect, (req, res) => {
  try {
    const { text, lang } = req.body;

    // Step 1: validate input
    if (!text) {
      return res.status(400).json({
        success: false,
        message: "Text is required",
      });
    }

    // Step 2: set language
    const language = lang || "en";

    // Step 3: create file name
    const fileName = `voice_${Date.now()}.mp3`;

    // Step 4: set file path
    const filePath = path.join(__dirname, "../tmp", fileName);

    // Step 5: create TTS object
    const tts = new gTTS(text, language);

    // Step 6: save audio file
    tts.save(filePath, (err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "TTS generation failed",
        });
      }

      // Step 7: send file to user
      res.setHeader("Content-Type", "audio/mpeg");

      res.sendFile(filePath, () => {
        fs.unlink(filePath, () => {}); //it will procduce and download it into tmp folder if commit
      });
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

router.get("/tts/result/:id", protect, async (req, res) => {
  try {
    const StudentProfile = require("../models/StudentProfile");
    const Scholarship = require("../models/Scholarship");
    const checkEligibility = require("../utils/eligibility");

    // ✅ check profile
    const profile = await StudentProfile.findOne({
      userId: req.user._id,
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    // ✅ check scholarship
    const scholarship = await Scholarship.findById(req.params.id);

    if (!scholarship) {
      return res.status(404).json({
        success: false,
        message: "Scholarship not found",
      });
    }

    // ✅ get eligibility
    const status = checkEligibility(profile, scholarship);

    // ✅ build message
    const message = `You are ${status} for ${scholarship.name}`;

    // ✅ support language
    const language = profile.preferredLanguage || "en";

    const fileName = `result_${Date.now()}.mp3`;
    const filePath = path.join(__dirname, "../tmp", fileName);

    const tts = new gTTS(message, language);

    tts.save(filePath, (err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "TTS failed",
        });
      }

      res.setHeader("Content-Type", "audio/mpeg");

      res.sendFile(filePath, () => {
        fs.unlink(filePath, () => {});
      });
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

module.exports = router;
