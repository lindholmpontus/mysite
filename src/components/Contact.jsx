import React, { useState } from "react";
import linkedinLogo from "../assets/linkedin.svg";
import githubLogo from "../assets/github.png";

export default function Contact() {
  const [showCopied, setShowCopied] = useState(false);

  const handleCopy = (value) => {
    navigator.clipboard.writeText(value);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 1200);
  };

  return (
    <section className="w-full max-w-2xl bg-[#111]/80 border border-green-900/20 rounded-xl p-8 mb-24">
      <h2 className="text-green-400 text-2xl font-mono mb-5">{"$ contact"}</h2>

      {showCopied && (
        <p className="text-green-400 font-mono text-sm mb-3 animate-pulse">
          ✔ Kopierat!
        </p>
      )}

      <p
        onClick={() => handleCopy("lindholmpontus@outlook.com")}
        className="font-mono text-green-200 mb-2 cursor-pointer block w-fit mx-auto text-center transition-transform hover:scale-110 hover:text-green-400"
      >
        [MAIL] → lindholmpontus@outlook.com
      </p>

      <p
        onClick={() => handleCopy("070-778 30 65")}
        className="font-mono text-green-200 mb-4 cursor-pointer block w-fit mx-auto text-center transition-transform hover:scale-110 hover:text-green-400"
      >
        [TEL ] → 070-778 30 65
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
    </section>
  );
}
