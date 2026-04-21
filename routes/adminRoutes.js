const express = require('express');
const router = express.Router();

const scrapeScholarships = require('../utils/scraper');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/admin/scrape', protect, adminOnly, async (req, res) => {
  try {
    const result = await scrapeScholarships();

    res.status(200).json({
      success: true,
      message: "Scraping completed",
      ...result
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;