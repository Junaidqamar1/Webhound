import express from "express";
import axios from "axios";
import cors from "cors";
import * as cheerio from "cheerio";

import puppeteer from "puppeteer-extra";
import puppeteer from "puppeteer-core";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

puppeteer.use(StealthPlugin());

const app = express();
app.use(cors({
  origin: "https://webhound.online", // Only allow your frontend
  methods: ["POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));
app.use(express.json());

/* ---------------- NORMALIZE URL ---------------- */

function normalizeUrl(url) {
  if (!url.startsWith("http")) {
    return "https://" + url;
  }
  return url;
}

/* ---------------- AUTO SCROLL ---------------- */

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 300;

      const timer = setInterval(() => {
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= document.body.scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 200);
    });
  });
}

/* ---------------- FETCH HTML ---------------- */

async function fetchHTML(url) {
  url = normalizeUrl(url);

  // const browser = await puppeteer.launch({
  //   headless: true,
  //   args: [
  //     "--no-sandbox",
  //     "--disable-setuid-sandbox",
  //     "--disable-blink-features=AutomationControlled",
  //   ],
  // });

  const browser = await puppeteer.launch({
  executablePath: "/usr/bin/chromium-browser",
});

  const page = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
  );

  await page.setViewport({
    width: 1366,
    height: 768,
  });

  await page.goto(url, {
    waitUntil: "networkidle2",
    timeout: 60000,
  });

  /* wait for real content */
  await page.waitForFunction(() => {
    return document.body.innerText.length > 1000;
  });

  await autoScroll(page);

  const html = await page.evaluate(() => document.documentElement.outerHTML);

  const performance = await page.evaluate(() => {
    const perf = window.performance.timing;

    return {
      domLoad: perf.domContentLoadedEventEnd - perf.navigationStart,
      fullLoad: perf.loadEventEnd - perf.navigationStart,
    };
  });

  await browser.close();

  return { html, performance };
}

/* ---------------- TECH STACK ---------------- */

function detectTechStack(html) {
  const stack = {
    framework: null,
    cms: null,
    libraries: [],
  };

  if (html.includes("_next/")) stack.framework = "Next.js";
  else if (html.includes("react")) stack.framework = "React";
  else if (html.includes("vue")) stack.framework = "Vue";

  if (html.includes("wp-content")) stack.cms = "WordPress";
  if (html.includes("shopify")) stack.cms = "Shopify";

  if (html.includes("jquery")) stack.libraries.push("jQuery");
  if (html.includes("bootstrap")) stack.libraries.push("Bootstrap");
  if (html.includes("tailwind")) stack.libraries.push("Tailwind CSS");

  return stack;
}

/* ---------------- STRUCTURE ---------------- */

function analyzeStructure($) {
  return {
    header: $("header").length,
    main: $("main").length,
    footer: $("footer").length,
    sections: $("section").length,
    headings: {
      h1: $("h1").length,
      h2: $("h2").length,
      h3: $("h3").length,
    },
  };
}

/* ---------------- META ---------------- */

function analyzeMeta($) {
  return {
    description: $('meta[name="description"]').attr("content") || null,
    viewport: $('meta[name="viewport"]').attr("content") || null,
    charset: $("meta[charset]").attr("charset") || null,
  };
}

/* ---------------- LINKS ---------------- */

function analyzeLinks($, baseUrl) {
  const base = new URL(baseUrl);

  let internal = 0;
  let external = 0;

  $("a[href]").each((_, el) => {
    try {
      const href = $(el).attr("href");
      const linkUrl = new URL(href, baseUrl);

      linkUrl.hostname === base.hostname ? internal++ : external++;
    } catch {}
  });

  return { internal, external };
}

/* ---------------- IMAGES ---------------- */

function analyzeImages($, baseUrl) {
  const images = [];

  $("img").each((_, img) => {
    const src =
      $(img).attr("src") ||
      $(img).attr("data-src") ||
      $(img).attr("data-lazy-src");

    if (!src) return;

    try {
      const imgUrl = new URL(src, baseUrl);

      images.push({
        url: imgUrl.href,
        alt: $(img).attr("alt") || "",
      });
    } catch {}
  });

  return {
    total: images.length,
    preview: images.slice(0, 5),
  };
}

/* ---------------- FONTS ---------------- */

function analyzeFonts($) {
  const fonts = new Set();

  $('link[href*="fonts.googleapis.com"]').each((_, el) => {
    const href = $(el).attr("href");

    const matches = href.match(/family=([^:&]+)/g);

    if (matches) {
      matches.forEach((f) =>
        fonts.add(decodeURIComponent(f.replace("family=", "")))
      );
    }
  });

  return [...fonts];
}

/* ---------------- MAIN ENDPOINT ---------------- */

app.post("/analyze", async (req, res) => {
  let { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL required" });
  }

  url = normalizeUrl(url);

  try {
    const { html, performance } = await fetchHTML(url);

    const $ = cheerio.load(html);

    res.json({
      meta: {
        title: $("title").text(),
        htmlSizeKB: (html.length / 1024).toFixed(2),
      },

      techStack: detectTechStack(html),

      structure: analyzeStructure($),

      metaTags: analyzeMeta($),

      links: analyzeLinks($, url),

      assets: {
        scripts: $("script").length,
        stylesheets: $('link[rel="stylesheet"]').length,
      },

      images: analyzeImages($, url),

      fonts: analyzeFonts($),

      performance,
    });
  } catch (err) {
    res.status(500).json({
      error: "Failed to analyze website",
      details: err.message,
    });
  }
});

/* ---------------- SERVER ---------------- */

app.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});