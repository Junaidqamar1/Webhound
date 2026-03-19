import express from "express";
import cors from "cors";
import puppeteer from "puppeteer"; // Standard puppeteer for better compatibility
import * as cheerio from "cheerio";

const app = express();

app.use(cors({ origin: "https://webhound.online" }));
app.use(express.json());

/* ---------------- HELPER: NORMALIZE URL ---------------- */
function normalizeUrl(url) {
  if (!url) return "";
  let trimmed = url.trim();
  if (!trimmed.startsWith("http")) return "https://" + trimmed;
  return trimmed;
}

/* ---------------- THE CORE SCRAPER ---------------- */
async function scrapeWebsite(targetUrl) {
  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu"
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
    
    // 1. Increase timeout and wait for network to be somewhat quiet
    await page.goto(targetUrl, { waitUntil: "networkidle0", timeout: 40000 });

    // 2. Force scroll to trigger "Lazy Loading" images
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        let distance = 500;
        let timer = setInterval(() => {
          window.scrollBy(0, distance);
          totalHeight += distance;
          if (totalHeight >= document.body.scrollHeight || totalHeight > 5000) {
            clearInterval(timer);
            resolve();
          }
        }, 100);
      });
    });

    // 3. Get the fully rendered HTML
    const html = await page.content();
    const $ = cheerio.load(html);

    // 4. Advanced Image Extraction (Grabbing src, data-src, and lazy-src)
    const images = [];
    $("img").each((_, el) => {
      const src = $(el).attr("src") || $(el).attr("data-src") || $(el).attr("data-lazy-src") || $(el).attr("srcset");
      if (src && !src.startsWith("data:image")) {
        try {
          images.push(new URL(src, targetUrl).href);
        } catch (e) {
          images.push(src);
        }
      }
    });

    return {
      meta: {
        title: $("title").text() || "No Title",
        description: $('meta[name="description"]').attr("content") || "",
        sizeKB: (html.length / 1024).toFixed(2)
      },
      structure: {
        h1: $("h1").length,
        h2: $("h2").length,
        images: images.length,
        links: $("a").length
      },
      imagePreview: [...new Set(images)].slice(0, 10), // Remove duplicates, take top 10
      tech: html.toLowerCase().includes("react") ? "React/Modern" : "Static/Classic"
    };

  } finally {
    await browser.close();
  }
}

/* ---------------- ENDPOINT ---------------- */
app.post("/analyze", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "URL required" });

  const target = normalizeUrl(url);

  try {
    const data = await scrapeWebsite(target);
    res.json(data);
  } catch (err) {
    console.error("Final Error:", err.message);
    res.status(500).json({ error: "Analysis failed", details: err.message });
  }
});

app.listen(3001, "0.0.0.0", () => console.log("Backend running on 3001"));