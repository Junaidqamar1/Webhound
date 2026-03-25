import { useEffect, useState } from "react";
import "./Section2.css";

const steps = [
  "Fetching HTML",
  "Parsing DOM",
  "Detecting Tech Stack",
  "Mapping Assets",
  "Structuring Data",
];

const results = [
  "HTML Loaded",
  "DOM Ready",
  "React Detected",
  "12 Images Found",
  "Report Generated",
];

export default function Section3() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 1400);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="section2">
      <div className="bg-shapes">
        <span className="shape s1">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 480">
            <path
              d="M360 289.7c43.4 0 86.9-16.6 120-49.7a169.2 169.2 0 0 0-120-49.7 169.2 169.2 0 0 0 49.7-120c-46.9 0-89.3 19-120 49.7 0-43.4-16.6-86.9-49.7-120a169.2 169.2 0 0 0-49.7 120 169.2 169.2 0 0 0-120-49.7c0 46.8 19 89.3 49.7 120-43.4 0-86.9 16.6-120 49.7a169.2 169.2 0 0 0 120 49.7 169.2 169.2 0 0 0-49.7 120c46.8 0 89.3-19 120-49.7 0 43.4 16.6 86.9 49.7 120a169.2 169.2 0 0 0 49.7-120 169.2 169.2 0 0 0 120 49.7c0-46.9-19-89.3-49.7-120Z"
              fill="rgb(204 59 51)"
            ></path>
          </svg>
        </span>
        <span className="shape s2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 480">
            <path
              d="M360 289.7c43.4 0 86.9-16.6 120-49.7a169.2 169.2 0 0 0-120-49.7 169.2 169.2 0 0 0 49.7-120c-46.9 0-89.3 19-120 49.7 0-43.4-16.6-86.9-49.7-120a169.2 169.2 0 0 0-49.7 120 169.2 169.2 0 0 0-120-49.7c0 46.8 19 89.3 49.7 120-43.4 0-86.9 16.6-120 49.7a169.2 169.2 0 0 0 120 49.7 169.2 169.2 0 0 0-49.7 120c46.8 0 89.3-19 120-49.7 0 43.4 16.6 86.9 49.7 120a169.2 169.2 0 0 0 49.7-120 169.2 169.2 0 0 0 120 49.7c0-46.9-19-89.3-49.7-120Z"
              fill="rgb(204 59 51)"
            ></path>
          </svg>
        </span>
        <span className="shape s3">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 480">
            <path
              d="M360 289.7c43.4 0 86.9-16.6 120-49.7a169.2 169.2 0 0 0-120-49.7 169.2 169.2 0 0 0 49.7-120c-46.9 0-89.3 19-120 49.7 0-43.4-16.6-86.9-49.7-120a169.2 169.2 0 0 0-49.7 120 169.2 169.2 0 0 0-120-49.7c0 46.8 19 89.3 49.7 120-43.4 0-86.9 16.6-120 49.7a169.2 169.2 0 0 0 120 49.7 169.2 169.2 0 0 0-49.7 120c46.8 0 89.3-19 120-49.7 0 43.4 16.6 86.9 49.7 120a169.2 169.2 0 0 0 49.7-120 169.2 169.2 0 0 0 120 49.7c0-46.9-19-89.3-49.7-120Z"
              fill="rgb(204 59 51)"
            ></path>
          </svg>
        </span>
      </div>
      <div className="container">
        <div className="left">
          <h2 className="heading font3">
            We don’t guess.
            <br />
            <span className="font2">We extract.</span>
          </h2>

          <div className="pipeline">
            {steps.map((step, i) => (
              <div
                key={i}
                className={`pipeline-step ${i === activeStep ? "active" : ""}`}
              >
                <div className="dot" />
                <span>{step}</span>

                {/* progress line */}
                {i < steps.length - 1 && <div className="line" />}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div className="right">
          <div className="result-card">
            <h4>Live Analysis</h4>

            <div className="result-list">
              {results.map((res, i) => (
                <div
                  key={i}
                  className={`result ${i <= activeStep ? "show" : ""}`}
                >
                  {res}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
