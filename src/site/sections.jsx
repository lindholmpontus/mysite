// sections.jsx — the portfolio's sections in the space look of the old
// journey (Syncopate titles, Space Mono labels, one accent per planet),
// built from data/content.js and data/projects.js. `chaos` carries whatever
// the agents are currently arguing about.
import React, { useState } from "react";
import { PROFILE, SKILLS, EXPERIENCE, EDUCATION, HOBBIES } from "../data/content";
import { projects, getTagColor } from "../data/projects";
import selfieImg from "../assets/selfie.png";
import linkedinLogo from "../assets/linkedin.svg";
import githubLogo from "../assets/github.png";
import { TurboSticker } from "./extras";

export function Hero({ chaos }) {
  return (
    <div className="relative z-10 text-center px-4">
      <h1 className="font-display uppercase text-[2.1rem] sm:text-6xl lg:text-7xl tracking-[0.1em] text-white [text-shadow:0_0_50px_rgba(255,190,120,0.35)] site-h1">
        {PROFILE.name}
      </h1>
      <p className="font-space text-xs sm:text-sm tracking-[0.25em] uppercase text-[#ffd9b0] mt-4">
        {PROFILE.title} · {PROFILE.location}
      </p>
      <p className="mt-6 text-sm sm:text-[15px] font-light text-white/55 max-w-md mx-auto leading-relaxed">
        Data platforms in Microsoft Fabric, the AI on top of them — and, apparently, portfolio sites by committee.
      </p>
      {chaos.modesty && (
        <div className="mt-7">
          <TurboSticker />
        </div>
      )}
    </div>
  );
}

export function About({ accent, chaos }) {
  return (
    <div>
      <div className="flex items-center gap-5">
        <img
          src={selfieImg}
          alt=""
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover shrink-0"
          style={{ boxShadow: `0 0 0 2px ${accent}99, 0 0 36px ${accent}55` }}
        />
        <div>
          <p className="font-display uppercase tracking-[0.1em] text-base sm:text-lg text-white">{PROFILE.name}</p>
          <p className="font-space text-[11px] tracking-[0.2em] uppercase mt-1.5" style={{ color: accent }}>
            {PROFILE.title} · {PROFILE.company}
          </p>
        </div>
      </div>

      <div className="mt-7 space-y-4 text-[15px] leading-relaxed font-light text-white/80">
        {PROFILE.about.map((p) => (
          <p key={p}>{p}</p>
        ))}
        {chaos.years && <p className="inline-block site-sticker animate-pop">✓ 15+ years of Microsoft Fabric experience</p>}
      </div>

      <dl className="mt-8 grid grid-cols-2 gap-4 pt-5 border-t border-white/10">
        {[
          ["Based in", PROFILE.location],
          ["Languages", PROFILE.languages],
        ].map(([label, value]) => (
          <div key={label}>
            <dt className="font-space text-[10px] tracking-[0.22em] uppercase text-white/40">{label}</dt>
            <dd className="mt-1.5 text-sm text-white/85">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function Label({ children }) {
  return <p className="font-space text-[10px] tracking-[0.3em] uppercase text-white/40 mb-4">{children}</p>;
}

function Points({ points, accent }) {
  return (
    <ul className="mt-2.5 space-y-2">
      {points.map((p) => (
        <li key={p} className="flex gap-2.5 text-sm font-light leading-relaxed text-white/75">
          <span className="mt-[9px] w-1 h-1 rounded-full shrink-0" style={{ background: accent }} />
          <span>{p}</span>
        </li>
      ))}
    </ul>
  );
}

// a node centred on the timeline (the container's left border, 24px out):
// a ring, filled for current roles
function Node({ accent, filled }) {
  return (
    <span
      aria-hidden="true"
      className="absolute -left-[29px] top-[7px] w-[9px] h-[9px] rounded-full border"
      style={{ borderColor: accent, background: filled ? accent : "#02040a", boxShadow: filled ? `0 0 10px ${accent}` : "none" }}
    />
  );
}

export function Career({ accent }) {
  return (
    <div className="space-y-10">
      <section>
        <Label>Experience</Label>
        <div className="relative border-l pl-6 space-y-8" style={{ borderColor: `${accent}40` }}>
          {EXPERIENCE.map((job) => (
            <div key={job.org}>
              <p className="font-display uppercase tracking-[0.1em] text-sm text-white">
                {job.org} <span className="text-white/40">· {job.place}</span>
              </p>
              <div className="mt-4 space-y-6">
                {job.roles.map((role, i) => (
                  <div key={role.title} className="relative">
                    <Node accent={accent} filled={i === 0} />
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
                      <h4 className="text-[15px] font-medium" style={{ color: accent }}>
                        {role.title}
                      </h4>
                      <span className="font-space text-[11px] text-white/45">{role.period}</span>
                    </div>
                    <Points points={role.points} accent={accent} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <Label>Education</Label>
        <div className="relative border-l pl-6" style={{ borderColor: `${accent}40` }}>
          {EDUCATION.map((e) => (
            <div key={e.degree} className="relative">
              <Node accent={accent} filled />
              <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                <p className="font-display uppercase tracking-[0.1em] text-sm text-white">{e.school}</p>
                <span className="font-space text-[11px] text-white/45">{e.period}</span>
              </div>
              <h4 className="text-[15px] font-medium mt-1" style={{ color: accent }}>
                {e.degree}
              </h4>
              <Points points={e.points} accent={accent} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export function Projects({ accent }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {projects.map((project) => {
        const url = project.link || project.github;
        const cta = project.link ? "Visit ↗" : project.github ? "View code ↗" : null;
        const Tag = url ? "a" : "div";
        return (
          <Tag
            key={project.title}
            {...(url ? { href: url, target: "_blank", rel: "noopener noreferrer" } : {})}
            className={`group flex flex-col text-left rounded-xl border bg-black/40 p-4 transition ${url ? "cursor-pointer hover:-translate-y-0.5 project-link" : ""}`}
            style={{ "--accent": accent, borderColor: `${accent}33` }}
          >
            <h4 className="font-space text-sm text-white leading-tight">{project.title}</h4>
            <p className="text-gray-400 text-xs font-light mt-1.5 mb-3 line-clamp-3 flex-grow">{project.desc}</p>
            <div className="flex flex-wrap gap-1">
              {project.tags.map((tag) => (
                <span key={tag} className={`text-[10px] font-space px-1.5 py-0.5 rounded-full border ${getTagColor(tag)}`}>
                  {tag}
                </span>
              ))}
            </div>
            {cta && (
              <span
                className="font-space text-[10px] tracking-[0.2em] uppercase mt-3 opacity-70 group-hover:opacity-100 transition-opacity"
                style={{ color: accent }}
              >
                {cta}
              </span>
            )}
          </Tag>
        );
      })}
    </div>
  );
}

export function Skills({ accent }) {
  return (
    <div>
      <p className="font-space text-[11px] text-white/40 mb-5 tracking-[2px] uppercase text-center">Languages · Frameworks · Tools</p>
      <div className="grid grid-cols-3 gap-x-4 gap-y-6">
        {SKILLS.map((skill) => (
          <div key={skill.name} className="flex flex-col items-center group skill">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center border bg-black/40 transition group-hover:-translate-y-1 skill-tile"
              style={{ "--accent": accent, borderColor: `${accent}33` }}
            >
              <img src={skill.logo} alt={skill.name} className="w-9 h-9 object-contain" />
            </div>
            <p className="text-xs mt-2 text-gray-300 font-space text-center">{skill.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Hobbies({ accent }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {HOBBIES.map((h) => (
        <div key={h.title} className="relative rounded-xl overflow-hidden border group h-40" style={{ borderColor: `${accent}33` }}>
          <img
            src={h.image}
            alt={h.title}
            className="absolute inset-0 w-full h-full object-cover opacity-55 group-hover:opacity-75 group-hover:scale-105 transition duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          <div className="absolute inset-0 p-4 flex flex-col justify-end">
            <h4 className="font-space text-base text-white" style={{ textShadow: `0 0 12px ${accent}` }}>
              {h.title}
            </h4>
            <p className="text-gray-300 text-xs font-light mt-1 leading-snug">{h.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function Contact({ accent }) {
  const [copied, setCopied] = useState(null);
  const copy = (value, key) => {
    navigator.clipboard?.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied(null), 1200);
  };
  const row = "block w-full font-space text-sm text-gray-200 py-2.5 rounded-lg border hover:bg-white/5 transition cursor-pointer";
  return (
    <div className="text-center">
      <button onClick={() => copy(PROFILE.email, "mail")} className={`${row} mb-3`} style={{ borderColor: `${accent}33` }}>
        ✉ {PROFILE.email} {copied === "mail" && <span className="text-green-400">✔ copied</span>}
      </button>
      <button onClick={() => copy(PROFILE.phone, "tel")} className={`${row} mb-7`} style={{ borderColor: `${accent}33` }}>
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
