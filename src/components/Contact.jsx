import React, { useState } from "react";
import linkedinLogo from "../assets/linkedin.svg";
import githubLogo from "../assets/github.png";

export default function Contact() {
  const [showCopied, setShowCopied] = useState(false);
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0 });

  const handleCopy = (value, event) => {
    navigator.clipboard.writeText(value);

    setTooltip({
      visible: true,
      x: event.clientX + 10, // lite offset från musen
      y: event.clientY + 10,
    });

    setTimeout(() => {
      setTooltip((t) => ({ ...t, visible: false }));
    }, 500);
  };



  return (
    <section className="w-full max-w-2xl bg-[#111]/80 border border-green-900/20 rounded-xl p-8 mb-24">
      <h2 className="text-green-400 text-2xl font-mono mb-5">{"contact"}</h2>

      {showCopied && (
        <p className="text-green-400 font-mono text-sm mb-3 animate-pulse">
          ✔ Kopierat!
        </p>
      )}
      <p
        onClick={(e) => handleCopy("lindholmpontus@outlook.com", e)}
        className="font-mono text-gray-300 mb-2 cursor-pointer block w-fit mx-auto text-center 
             transition-transform hover:scale-110 hover:text-white"
      >
        lindholmpontus@outlook.com
      </p>

      <p
        onClick={(e) => handleCopy("070-778 30 65", e)}
        className="font-mono text-gray-300 mb-4 cursor-pointer block w-fit mx-auto text-center 
             transition-transform hover:scale-110 hover:text-white"
      >
        070-778 30 65
      </p>


      <div className="flex justify-center gap-10 mt-4">
        <a
          href="https://www.linkedin.com/in/pontus-lindholm-170708368"
          target="_blank"
          className="hover:scale-110 transition"
        >
          <img src={linkedinLogo} className="w-12 h-12" alt="LinkedIn" />
        </a>
        <a
          href="https://github.com/lindholmpontus"
          target="_blank"
          className="hover:scale-110 transition"
        >
          <img src={githubLogo} className="w-12 h-12 rounded" alt="GitHub" />
        </a>
      </div>
      {tooltip.visible && (
        <div
          className="fixed pointer-events-none font-mono text-white text-sm px-2 py-1 
               bg-black/80 border border-white/20 rounded shadow-lg opacity-100
               transition-opacity duration-200"
          style={{
            top: tooltip.y,
            left: tooltip.x,
          }}
        >
          ✔ Kopierat!
        </div>
      )}

    </section>
  );
}
