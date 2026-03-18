import express from "express";
import cors from "cors";
import * as cheerio from "cheerio";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

puppeteer.use(StealthPlugin());

const app = express();

// 1. UPDATE CORS: Match your exact frontend domain
app.use(cors({
  origin: "https://webhound.online", 
  methods: ["POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

/* ---------------- NORMALIZE URL ---------------- */
function normalizeUrl(url) {
  if (!url) return "";
  let trimmed = url.trim();
  if (!trimmed.startsWith("http")) {
    return "https://" + trimmed;
  }
  return trimmed;
}

/* ---------------- AUTO SCROLL (Optimized) ---------------- */
async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 400;
      const maxScrolls = 10; // Don't scroll forever
      let scrolls = 0;
      const timer = setInterval(() => {
        window.scrollBy(0, distance);
        totalHeight += distance;
        scrolls++;
        if (totalHeight >= document.body.scrollHeight || scrolls >= maxScrolls) {
          clearInterval(timer);
          resolve();
        }
      }, 150);
    });
  });
}

/* ---------------- FETCH HTML ---------------- */
async function fetchHTML(url) {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage", // Uses disk instead of memory for temp files
      "--disable-gpu",
      "--no-zygote",
      "--single-process" // Drastically reduces RAM usage
    ],
  });

  try {
    const page = await browser.newPage();
    
    // Using a shorter timeout and 'domcontentloaded' to prevent 500 errors on slow sites
    await page.goto(url, { 
      waitUntil: "domcontentloaded", 
      timeout: 30000 
    });

    await page.setViewport({ width: 1280, height: 800 });
    
    // Minimal wait for content
    await page.waitForFunction(() => document.body.innerText.length > 100, { timeout: 5000 }).catch(() => {});

    await autoScroll(page);

    const html = await page.evaluate(() => document.documentElement.outerHTML);
    const performance = await page.evaluate(() => {
      const perf = window.performance.timing;
      return {
        domLoad: perf.domContentLoadedEventEnd - perf.navigationStart,
        fullLoad: perf.loadEventEnd - perf.navigationStart,
      };
    });

    return { html, performance };
  } finally {
    await browser.close(); // IMPORTANT: Prevents memory leaks
  }
}

/* ---------------- ANALYZERS (Optimized) ---------------- */
function detectTechStack(html) {
  const stack = { framework: null, cms: null, libraries: [] };
  const h = html.toLowerCase();
  if (h.includes("_next/")) stack.framework = "Next.js";
  else if (h.includes("react")) stack.framework = "React";
  if (h.includes("wp-content")) stack.cms = "WordPress";
  if (h.includes("jquery")) stack.libraries.push("jQuery");
  if (h.includes("tailwind")) stack.libraries.push("Tailwind CSS");
  return stack;
}

/* ---------------- MAIN ENDPOINT ---------------- */
app.post("/analyze", async (req, res) => {
  let { url } = req.body;
  if (!url) return res.status(400).json({ error: "URL required" });

  const normalizedUrl = normalizeUrl(url);
  console.log("Analyzing:", normalizedUrl);

  try {
    const { html, performance } = await fetchHTML(normalizedUrl);
    const $ = cheerio.load(html);

    res.json({
      meta: {
        title: $("title").text(),
        htmlSizeKB: (html.length / 1024).toFixed(2),
      },
      techStack: detectTechStack(html),
      structure: {
        header: $("header").length,
        footer: $("footer").length,
        headings: { h1: $("h1").length, h2: $("h2").length }
      },
      performance
    });
  } catch (err) {
    console.error("Scraping Error:", err.message);
    res.status(500).json({
      error: "The server couldn't start the browser.",
      details: err.message
    });
  }
});

app.listen(3001, () => {
  console.log("Server running on port 3001");
});