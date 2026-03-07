import { useEffect, useRef } from "react";

// Assets (Existing imports)
import react from "./assets/react.svg";
import wp from "./assets/wordpress.png";
import js from "./assets/js.png";
import java from "./assets/java.png";
import mongodb from "./assets/mongodb.svg";
import django from "./assets/django.svg";
import css from "./assets/css.svg";
import html from "./assets/html.svg";
import next from "./assets/nextjs.svg";
import node from "./assets/nodejs.svg";
import img from "./assets/img.svg";

type HeroProps = {
  url: string;
  setUrl: (v: string) => void;
  analyze: () => void;
  loading: boolean;
};

export default function Hero({ url, setUrl, analyze, loading }: HeroProps) {
  // 1. Create the reference for the bottom section
  const bottomSectionRef = useRef<HTMLDivElement>(null);

  // 2. Your existing Mouse Parallax Effect
  useEffect(() => {
    const icons = document.querySelectorAll<HTMLElement>(".float");
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 12;
      const y = (e.clientY / window.innerHeight - 0.5) * 12;
      icons.forEach((icon) => {
        const depth = Number(icon.dataset.depth || 1);
        icon.style.transform = `translate(${x * depth}px, ${y * depth}px)`;
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);
  useEffect(() => {
    if (!loading && url) {
      // We use a small timeout to make sure the Report component
      // has actually appeared in the DOM before we try to find it.
      setTimeout(() => {
        const element = document.getElementById("report-section");
        if (element) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 100);
    }
  }, [loading, url]);

  // 3. THE AUTO-SCROLLER
  // This watches the 'loading' prop. When it finishes (false) and a URL exists, it scrolls.
  useEffect(() => {
    if (!loading && url) {
      bottomSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [loading, url]);

  return (
    <div className="page-container">
      {/* SECTION 1: THE HERO */}
      <div className="hero">
        <h1 className="hero-head font2">
          From markup to media.{" "}
          <span className="head-span font3">All visible.</span>
        </h1>

        <p className="hero-subhead font4">
          Weblyzer maps pages, content, tags, assets, and technologies to
          describe what a website contains.
        </p>

        <div className="search">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
          />

          <button
            type="button"
            onClick={analyze}
            disabled={loading}
            className="analyze-btn"
          >
            {loading ? <span className="spinner"></span> : "Analyze"}
          </button>
        </div>

        {/* Floating icons (Keeping your parallax divs) */}
        <div className="float tag t1" data-depth="2">
          <img src={react} alt="" />
        </div>
        <div className="float tag t2" data-depth="5">
          <img src={java} alt="" />
        </div>
        <div className="float tag t3" data-depth="6">
          <img src={js} alt="" />
        </div>
        <div className="float tag t4" data-depth="1">
          <img src={wp} alt="" />
        </div>
   
        <div className="float tag t6" data-depth="4">
          <img src={html} alt="" />
        </div>
        <div className="float tag t7" data-depth="3">
          <img src={mongodb} alt="" />
        </div>
        <div className="float tag t8" data-depth="8">
          <img src={django} alt="" />
        </div>
        <div className="float tag t9" data-depth="7">
          <img src={img} alt="" />
        </div>
        <div className="float tag t10" data-depth="4">
          <img src={js} alt="" />
        </div>
        <div className="float tag t11" data-depth="2">
          <img src={next} alt="" />
        </div>
        <div className="float tag t11" data-depth="9">
          <img src={node} alt="" />
        </div>
      
      </div>
    </div>
  );
}
