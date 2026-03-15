import express from "express";
import axios from "axios";
import cors from "cors";
import * as cheerio from "cheerio";
import puppeteer from "puppeteer";

const app = express();
app.use(cors());
app.use(express.json());


async function fetchHTML(url) {
  try {
  
    const res = await axios.get(url, { timeout: 8000 });
    const html = res.data;

    if (html.length < 2000 || html.includes('id="root"')) {
      throw new Error("Static HTML too weak");
    }

    return html;
  } catch {
    
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    const html = await page.content();
    await browser.close();

    return html;
  }
}

/* ---------------- TECH STACK ---------------- */

function detectTechStack(html) {
  const stack = {
    framework: null,
    cms: null,
    libraries: [],
  };

  if (html.includes("_next/")) stack.framework = "Next.js";
  else if (html.includes("data-reactroot") || html.includes("react"))
    stack.framework = "React";
  else if (html.includes("vue")) stack.framework = "Vue";

  if (html.includes("wp-content")) stack.cms = "WordPress";

  if (html.includes("jquery")) stack.libraries.push("jQuery");
  if (html.includes("tailwind")) stack.libraries.push("Tailwind CSS");
  if (html.includes("bootstrap")) stack.libraries.push("Bootstrap");

  return stack;
}

/* ---------------- STRUCTURE ---------------- */

function analyzeStructure($) {
  return {
    hasHeader: $("header").length > 0,
    hasMain: $("main").length > 0,
    hasFooter: $("footer").length > 0,
    sections: $("section").length,
    headings: {
      h1: $("h1").length,
      h2: $("h2").length,
      h3: $("h3").length,
      h4: $("h4").length,
      h5: $("h5").length,
      h6: $("h6").length,
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
  const base = new URL(baseUrl);
  const images = [];

  $("img[src]").each((_, img) => {
    try {
      const src = $(img).attr("src");
      const imgUrl = new URL(src, baseUrl);

      images.push({
        url: imgUrl.href,
        alt: $(img).attr("alt") || "",
      });
    } catch {}
  });

  return {
    total: images.length,
    preview: images.slice(0, 5), // 🔥 only 5 for UI
    all: images,
  };
}

/* ---------------- FONTS (CLEAN VERSION) ---------------- */

function analyzeFonts($) {
  const fonts = new Set();

  // Google fonts
  $('link[href*="fonts.googleapis.com"]').each((_, el) => {
    const href = $(el).attr("href");
    const matches = href.match(/family=([^:&]+)/g);

    if (matches) {
      matches.forEach((f) =>
        fonts.add(decodeURIComponent(f.replace("family=", ""))),
      );
    }
  });

  // Inline styles (clean only names)
  $("[style*='font-family']").each((_, el) => {
    const style = $(el).attr("style");
    const match = style.match(/font-family:\s*([^;]+)/i);

    if (match) {
      const clean = match[1].split(",")[0].replace(/['"]/g, "").trim();
      fonts.add(clean);
    }
  });

  return [...fonts].slice(0, 10); // 🔥 limit fonts
}

/* ---------------- MAIN ENDPOINT ---------------- */

app.post("/analyze", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "URL required" });

  try {
    const html = await fetchHTML(url);
    const $ = cheerio.load(html);

    res.json({
      meta: {
        title: $("title").text() || null,
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
    });
  } catch (err) {
    res.status(400).json({ error: "Failed to analyze website" });
  }
});

/* ---------------- SERVER ---------------- */

app.listen(3001, () => {
  console.log("✅ Backend running on http://localhost:3001");
});
