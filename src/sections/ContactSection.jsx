// ContactSection.jsx — email/phone (click to copy) + socials.
import React, { useState } from "react";
import { PROFILE } from "../data/content";
import linkedinLogo from "../assets/linkedin.svg";
import githubLogo from "../assets/github.png";

export default function ContactSection() {
  const [copied, setCopied] = useState(null);

  const copy = (value, key) => {
    navigator.clipboard?.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied(null), 1000);
  };

  return (
    <div className="text-center">
      <button
        onClick={() => copy(PROFILE.email, "mail")}
        className="block w-full font-mono text-sm text-gray-200 mb-3 py-2 rounded-lg border border-white/10 hover:bg-white/5 transition"
      >
        ✉ {PROFILE.email} {copied === "mail" && <span className="text-green-400">✔ copied</span>}
      </button>
      <button
        onClick={() => copy(PROFILE.phone, "tel")}
        className="block w-full font-mono text-sm text-gray-200 mb-6 py-2 rounded-lg border border-white/10 hover:bg-white/5 transition"
      >
        ☎ {PROFILE.phone} {copied === "tel" && <span className="text-green-400">✔ copied</span>}
      </button>

      <div className="flex justify-center gap-8">
        <a href={PROFILE.linkedin} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition">
          <img src={linkedinLogo} className="w-10 h-10" alt="LinkedIn" />
        </a>
        <a href={PROFILE.github} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition">
          <img src={githubLogo} className="w-10 h-10 rounded" alt="GitHub" />
        </a>
      </div>

    </div>
  );
}
