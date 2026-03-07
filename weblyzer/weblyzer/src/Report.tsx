import "./report.css";

type ReportProps = {
  report: any;
};

export default function Report({ report }: ReportProps) {
  if (!report) return null;

  const { meta, techStack, structure, images, fonts } = report;
  const downloadReport = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute(
      "download",
      `weblyzer-report-${meta?.title || "site"}.json`,
    );
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <section className="sec-2" id="report-section">
      <div className="report-surface">
        {/* HEADER */}
        <div className="report-header">
          <div className="">
            <h2 className="font2 report-head">Analysis Report</h2>
            <p className="muted">
              Parsed directly from the site’s public markup
            </p>
          </div>
          <div className="">
            <button className="download-btn font1" onClick={downloadReport}>
              Downlaod
            </button>
          </div>
        </div>

        <div className="report-grid">
          {/* SITE */}
          <div className="panel">
            <h4 className="panel-title">Site</h4>
            <p className="big font2">{meta?.title || "Not found"}</p>
            <p className="muted">{meta?.htmlSizeKB} KB HTML</p>
          </div>

          {/* TECH STACK */}
          <div className="panel">
            <h4 className="panel-title">Tech Stack</h4>

            <div className="pill-row">
              <span className="pill">
                {techStack?.framework || "Framework: none"}
              </span>
              <span className="pill">{techStack?.cms || "CMS: none"}</span>
            </div>

            <div className="pill-row">
              {techStack?.libraries?.length > 0 ? (
                techStack.libraries.map((lib: string, i: number) => (
                  <span key={i} className="pill subtle">
                    {lib}
                  </span>
                ))
              ) : (
                <span className="pill subtle">No libraries detected</span>
              )}
            </div>
          </div>

          {/* STRUCTURE */}
          <div className="panel full">
            <h4 className="panel-title">Structure</h4>

            <div className="status-row">
              <span className={`status ${structure?.hasHeader ? "on" : "off"}`}>
                Header
              </span>
              <span className={`status ${structure?.hasMain ? "on" : "off"}`}>
                Main
              </span>
              <span className={`status ${structure?.hasFooter ? "on" : "off"}`}>
                Footer
              </span>
              <span className="status neutral">
                Sections: {structure?.sections ?? "—"}
              </span>
            </div>
          </div>

          {/* CONTENT */}
          <h2 className="font2 report-head">Content</h2>

          <div className="panel full">
            <h4 className="panel-title">Headings</h4>

            <div className="status-row">
              {Object.entries(structure?.headings || {}).map(([tag, count]) => (
                <span key={tag} className="status neutral">
                  {tag.toUpperCase()}: <strong>{count as number}</strong>
                </span>
              ))}
            </div>
          </div>

          {/* FONTS (FIXED) */}
          <div className="panel full">
            <h4 className="panel-title">Fonts</h4>

            <div className="pill-row">
              {fonts?.length > 0 ? (
                fonts.map((font: string, i: number) => (
                  <span key={i} className="pill subtle">
                    {font}
                  </span>
                ))
              ) : (
                <span className="pill subtle">No fonts detected</span>
              )}
            </div>
          </div>

          {/* IMAGES (FIXED + UI IMPROVED) */}
          <div className="panel full">
            <div className="panel-title-row">
              <h4 className="panel-title">Images</h4>
              <span className="muted">Total Images: {images?.total || 0}</span>
            </div>

            <div className="image-stack">
              {images?.preview?.map((img: any, i: number) => (
                <div
                  key={i}
                  className="image-thumb"
                  style={{
                    transform: `translateX(${i * -20}px)`,
                    zIndex: 10 - i,
                  }}
                >
                  <img src={img.url} alt={img.alt || ""} />
                </div>
              ))}

              {images?.total > 5 && (
                <button className="show-more">+{images.total - 5} more</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
