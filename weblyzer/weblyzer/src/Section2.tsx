// import { useEffect } from "react";
// import img from "./assets/Home (1).png";

// export default function Section2() {
//   useEffect(() => {}, []);

//   return (
//     <section className="section-2 main-container">
//       <div className="cont">
//         <h2 className="font4">We break down structure</h2>

//         <div className="headline">
//           <span className="text1">Content</span>
//           <span className="filled">Assets</span>
//           <span>and Technologies.</span>
//         </div>

//         <p className="desc font1">
//           We analyze every layer of your digital presence — from messaging and
//           visuals to code architecture — and optimize it for clarity,
//           performance and growth.
//         </p>

//         <div className="mini-tags">
//           <span>Strategy</span>
//           <span>Design</span>
//           <span>Development</span>
//         </div>
//       </div>

//       <div className="cont2">
//         <div className="target1 target1-1 cont-header target">
//           <p>header</p>
//         </div>
//         <div className="target1 target1-2 cont-header target">
//           <p>H2 Tag</p>
//         </div>
//         <div className="target2-1 target2 cont-header target">
//           <p>font-family</p>
//         </div>
//         <div className="target2-2 target2 cont-header target">
//           <p>img</p>
//         </div>
//         <div className="target2-3 target2 cont-header target">
//           <p>Svg</p>
//         </div>
//         <svg
//           width="100"
//           height="100"
//           viewBox="0 0 100 100"
//           xmlns="http://www.w3.org/2000/svg"
//         >
//           <rect width="100" height="100" fill="none" />

//           <path
//             d="M50 5 L52.4 33.6 L72.5 12.5 L63.6 39.8 L90.5 25 L71.2 44.5 L100 50 L71.2 55.5 L90.5 75 L63.6 60.2 L72.5 87.5 L52.4 66.4 L50 95 L47.6 66.4 L27.5 87.5 L36.4 60.2 L9.5 75 L28.8 55.5 L0 50 L28.8 44.5 L9.5 25 L36.4 39.8 L27.5 12.5 L47.6 33.6 Z"
//             fill="#D9532D"
//           />
//         </svg>
//         <img src={img} alt="Structure breakdown preview" />
//       </div>
//     </section>
//   );
// }
import { useEffect } from "react";
import img from "./assets/Home (1).png";
import "./sec.css";

export default function Section2() {
  useEffect(() => {}, []);

  return (
    <section className="section-2 main-container">
      {/* LEFT */}

      <div className="cont">
        <h2 className="font4">We break down structure</h2>

        <div className="headline">
          <span className="text1">Content</span>
          <span className="filled">Assets</span>
          <span>and Technologies.</span>
        </div>

        <p className="desc font1">
          We analyze every layer of your digital presence — from messaging and
          visuals to code architecture — and optimize it for clarity,
          performance and growth.
        </p>

        <div className="mini-tags">
          <span>Strategy</span>
          <span>Design</span>
          <span>Development</span>
        </div>
      </div>

      {/* RIGHT */}
      <div className="cont2">
        {/* FLOATING TAGS */}
        <div className="target target1 target1-1">
          <p>Header</p>
        </div>

        <div className="target target1 target1-2">
          <p>Heading (H2)</p>
        </div>

        <div className="target target2 target2-1">
          <p>Font Family</p>
        </div>

        <div className="target target2 target2-2">
          <p>Image Asset</p>
        </div>

        <div className="target target2 target2-3">
          <p>SVG Icon</p>
        </div>

        {/* ROTATING SVG */}
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M50 5 L52.4 33.6 L72.5 12.5 L63.6 39.8 L90.5 25 L71.2 44.5 L100 50 L71.2 55.5 L90.5 75 L63.6 60.2 L72.5 87.5 L52.4 66.4 L50 95 L47.6 66.4 L27.5 87.5 L36.4 60.2 L9.5 75 L28.8 55.5 L0 50 L28.8 44.5 L9.5 25 L36.4 39.8 L27.5 12.5 L47.6 33.6 Z"
            fill="#cc3b33"
          />
        </svg>

        {/* MAIN IMAGE */}
        <img src={img} alt="Structure breakdown preview" />
      </div>
    </section>
  );
}
