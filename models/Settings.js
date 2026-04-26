const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    // ================= GENERAL =================
    siteName: { type: String, default: "ScholarFinder" },
    defaultLanguage: { type: String, default: "English" },
    multilingual: { type: Boolean, default: false },
    ttsEnabled: { type: Boolean, default: false },
    jwtExpiry: { type: String, default: "24h" },

    // ================= SCHOLARSHIP SCOPE =================
    scholarshipScope: {
      usa: { type: Boolean, default: true },
      europe: { type: Boolean, default: true },
      bachelor: { type: Boolean, default: true },
      masters: { type: Boolean, default: true },
      phd: { type: Boolean, default: true },
      postdoc: { type: Boolean, default: false },
    },

    // ================= SCRAPER =================
    scraper: {
      autoScrape: { type: Boolean, default: true },
      cron: { type: String, default: "0 0 * * *" },
      frequency: { type: String, default: "24h" },
      delay: { type: Number, default: 2000 },
      timeout: { type: Number, default: 20000 },

      sources: [
        {
          name: String,
          url: String,
          enabled: Boolean,
        },
      ],
    },

    // ================= DECISION TREE =================
    decisionRules: {
      minCGPA: {
        bachelors: Number,
        masters: Number,
        phd: Number,
      },
      minIELTS: Number,
      strictIELTS: Number,
      partialBand: Number,
    },

    eligibilityLogic: {
      checkCGPAFirst: Boolean,
      checkIELTS: Boolean,
      checkDegree: Boolean,
      allowPartial: Boolean,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Settings", settingsSchema);
