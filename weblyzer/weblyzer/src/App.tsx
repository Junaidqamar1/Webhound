import { useState } from "react";
import Hero from "./Hero";
import Report from "./Report";
import "./App.css";
import Section2 from "./Section2";
import Section3 from "./Thirdsec";
import Nav from "./Nav";

function App() {
  const [url, setUrl] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (!url) return;

    try {
      setLoading(true);
      setReport(null);

      const res = await fetch("http://localhost:3001/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();
      console.log(data);
      setReport(data);
    } catch (error) {
      console.error("Error analyzing:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Nav />
      <Hero url={url} setUrl={setUrl} analyze={analyze} loading={loading} />
      <Section2 />
      <Section3 />
      <Report report={report} />
    </>
  );
}

export default App;
