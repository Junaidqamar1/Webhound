import express from "express";
import axios from "axios";
import cors from "cors";
import * as cheerio from "cheerio";

const app = express();

// 1. GLOBAL MIDDLEWARE
// Set origin to your exact frontend domain to prevent CORS blocks
app.use(cors({
  origin: "https://webhound.online",
  methods: ["POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

/* ---------------- HELPERS ---------------- */

function normalizeUrl(url) {
  if (!url) return "";
  let trimmed = url.trim();
  if (!trimmed.startsWith("http")) {
    return "https://" + trimmed;
  }
  return trimmed;
}

function detectTechStack(html) {
  const stack = { framework: "Static/Other", cms: "None", libraries: [] };
  const h = html.toLowerCase();

  // Framework Detection
  if (h.includes("_next/")) stack.framework = "Next.js";
  else if (h.includes("react")) stack.framework = "React";
  else if (h.includes("vue")) stack.framework = "Vue.js";

  // CMS Detection
  if (h.includes("wp-content") || h.includes("wordpress")) stack.cms = "WordPress";
  if (h.includes("shopify")) stack.cms = "Shopify";

  // Library Detection
  if (h.includes("jquery")) stack.libraries.push("jQuery");
  if (h.includes("bootstrap")) stack.libraries.push("Bootstrap");
  if (h.includes("tailwind")) stack.libraries.push("Tailwind CSS");

  return stack;
}

/* ---------------- MAIN ANALYZE ENDPOINT ---------------- */

app.post("/analyze", async (req, res) => {
  let { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  const targetUrl = normalizeUrl(url);
  console.log(`Analyzing: ${targetUrl}`);

  try {
    // We use Axios to get the HTML directly (Lightweight & Reliable)
    const response = await axios.get(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8"
      },
      timeout: 15000 // 15 second limit to prevent hanging
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // Build the final report object
    const report = {
      meta: {
        title: $("title").text().trim() || "No title tag found",
        htmlSizeKB: (Buffer.byteLength(html) / 1024).toFixed(2),
        description: $('meta[name="description"]').attr("content") || null
      },
      techStack: detectTechStack(html),
      structure: {
        header: $("header").length,
        main: $("main").length,
        footer: $("footer").length,
        sections: $("section").length,
        headings: {
          h1: $("h1").length,
          h2: $("h2").length,
          h3: $("h3").length,
        },
      },
      assets: {
        scripts: $("script").length,
        stylesheets: $('link[rel="stylesheet"]').length,
        images: $("img").length
      },
      // Extract first 5 images for preview
      imagePreview: []
    };

    // Grab up to 5 image URLs
    $("img").slice(0, 5).each((_, img) => {
      const src = $(img).attr("src");
      if (src) {
        try {
          report.imagePreview.push(new URL(src, targetUrl).href);
        } catch (e) {
          report.imagePreview.push(src);
        }
      }
    });

    res.json(report);

  } catch (err) {
    console.error("Analysis Error:", err.message);
    
    res.status(500).json({
      error: "Failed to analyze website",
      details: err.message === "timeout of 15000ms exceeded" 
        ? "The website took too long to respond." 
        : err.message
    });
  }
});

/* ---------------- SERVER ---------------- */

// We listen on 3001 as you requested
const PORT = 3001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Webhound Backend is LIVE at http://server.webhound.online (Port ${PORT})`);
});