const axios = require("axios");
const puppeteer = require("puppeteer");

const headers = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept-Language": "en-US,en;q=0.9",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
};

let browserInstance = null;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function getBrowser() {
  if (!browserInstance) {
    browserInstance = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    });
  }
  return browserInstance;
}

async function closeBrowser() {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
}

async function fetchStaticHtml(url, timeout = 20000) {
  const { data } = await axios.get(url, { headers, timeout });
  return data;
}

async function fetchDynamicHtml(url, { waitFor, timeout = 45000 } = {}) {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    await page.setUserAgent(headers["User-Agent"]);
    await page.setExtraHTTPHeaders({ "Accept-Language": "en-US,en;q=0.9" });
    await page.goto(url, { waitUntil: "domcontentloaded", timeout });

    if (waitFor) {
      await page.waitForSelector(waitFor, { timeout: 20000 }).catch(() => {});
    } else {
      await page.waitForNetworkIdle({ idleTime: 1000, timeout: 15000 }).catch(() => {});
    }

    return await page.content();
  } finally {
    await page.close();
  }
}

async function fetchHtml(url, options = {}) {
  const { dynamic = false, waitFor, timeout } = options;

  if (dynamic) {
    return fetchDynamicHtml(url, { waitFor, timeout });
  }

  return fetchStaticHtml(url, timeout);
}

/**
 * Retries failed requests and falls back to the other fetch method (static ↔ dynamic).
 */
async function fetchHtmlRobust(url, options = {}) {
  const {
    dynamic = false,
    waitFor,
    timeout,
    retries = 2,
    tryBoth = true,
  } = options;

  const primary = dynamic ? fetchDynamicHtml : fetchStaticHtml;
  const fallback = dynamic ? fetchStaticHtml : fetchDynamicHtml;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      if (dynamic) {
        return await fetchDynamicHtml(url, { waitFor, timeout: timeout || 45000 });
      }
      return await fetchStaticHtml(url, timeout || 20000);
    } catch (err) {
      if (attempt < retries) {
        await delay(1500 * (attempt + 1));
        continue;
      }
      if (tryBoth) {
        try {
          if (dynamic) {
            return await fetchStaticHtml(url, timeout || 20000);
          }
          return await fetchDynamicHtml(url, { waitFor, timeout: timeout || 45000 });
        } catch {
          throw err;
        }
      }
      throw err;
    }
  }
}

module.exports = {
  fetchHtml,
  fetchHtmlRobust,
  fetchStaticHtml,
  fetchDynamicHtml,
  closeBrowser,
  headers,
};
