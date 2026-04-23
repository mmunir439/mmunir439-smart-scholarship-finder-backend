const axios = require("axios");

const headers = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept-Language": "en-US,en;q=0.9",
};

// ─────────────────────────────────────────────
// Fetch a page with retry logic
// If request fails, it tries again up to 3 times
// ─────────────────────────────────────────────
async function fetchPage(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const { data } = await axios.get(url, { headers, timeout: 15000 });
      return data;
    } catch (err) {
      console.warn(
        `[fetchPage] Attempt ${i + 1} failed for ${url}: ${err.message}`,
      );
      if (i < retries - 1) {
        await new Promise((r) => setTimeout(r, 3000)); // wait 3s before retry
      }
    }
  }
  console.error(`[fetchPage] All ${retries} attempts failed for ${url}`);
  return null;
}

module.exports = { fetchPage };
