// sections.jsx — the portfolio's sections, built from data/content.js and
// data/projects.js. `chaos` carries whatever the agents are currently
// arguing about (buzzwords, a merge conflict, a flattering tagline…).
import React, { useState } from "react";
import { PROFILE, SKILLS, EXPERIENCE, EDUCATION, HOBBIES } from "../data/content";
import { projects } from "../data/projects";
import selfieImg from "../assets/selfie.png";
import linkedinLogo from "../assets/linkedin.svg";
import githubLogo from "../assets/github.png";

function Heading({ kicker, children }) {
  return (
    <div className="mb-8 sm:mb-10">
      <p className="site-kicker">{kicker}</p>
      <h2 className="site-h2">{children}</h2>
    </div>
  );
}

export function Hero({ chaos }) {
  return (
    <div className="pt-16 sm:pt-24 pb-6">
      <p className="site-kicker">
        {PROFILE.title} · {PROFILE.company} · {PROFILE.location}
      </p>
      <h1 className="site-h1 mt-4">
        Pontus
        <br />
        <em>Lindholm</em>
      </h1>
      <p className="mt-6 max-w-xl text-lg site-muted leading-relaxed">
        I build data platforms in Microsoft Fabric and the AI-related things on top of them — and, apparently, portfolio sites by committee.
      </p>
      {chaos.modesty && (
        <p className="mt-6 inline-block site-sticker animate-pop">
          ⚡ objectively the best engineer in Gävle<sup>*</sup>
          <span className="block text-xs font-normal opacity-70 mt-0.5">*source: TURBO</span>
        </p>
      )}
    </div>
  );
}

export function About({ chaos }) {
  return (
    <div>
      <Heading kicker="01 — about">Hi, I'm Pontus.</Heading>
      <div className="grid sm:grid-cols-[auto_1fr] gap-8 items-start">
        <img src={selfieImg} alt="Pontus Lindholm" className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover site-ring" />
        <div className="space-y-4 text-[1.05rem] leading-relaxed">
          {PROFILE.about.map((p) => (
            <p key={p}>{p}</p>
          ))}
          {chaos.buzz && (
            <p className="site-sticker animate-pop">synergy-driven, blockchain-ready, AI-native 10x rockstar ninja 🥷</p>
          )}
          <dl className="grid grid-cols-2 gap-4 pt-5 mt-2 border-t site-border">
            {[
              ["Based in", PROFILE.location],
              ["Languages", PROFILE.languages],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="site-kicker">{k}</dt>
                <dd className="mt-1">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}

export function Career() {
  const items = [
    ...EXPERIENCE.flatMap((e) => e.roles.map((r) => ({ ...r, org: `${e.org} · ${e.place}` }))),
    ...EDUCATION.map((e) => ({ title: e.degree, org: e.school, period: e.period, points: e.points })),
  ];
  return (
    <div>
      <Heading kicker="02 — career & education">Where I've been.</Heading>
      <ol className="relative border-l site-border ml-1.5 space-y-10">
        {items.map((it) => (
          <li key={it.title} className="pl-7 relative">
            <span className="absolute -left-[7px] top-2 w-3 h-3 rounded-full site-dot" />
            <p className="site-kicker">{it.period}</p>
            <h3 className="text-xl font-semibold mt-1">{it.title}</h3>
            <p className="site-muted">{it.org}</p>
            <ul className="mt-3 space-y-2 max-w-2xl">
              {it.points.map((p) => (
                <li key={p} className="site-muted leading-relaxed pl-4 relative before:content-['–'] before:absolute before:left-0">
                  {p}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function Projects({ chaos }) {
  return (
    <div>
      {chaos.conflict ? (
        <pre className="site-conflict mb-10">
          {"<<<<<<< TURBO\n"}
          <span className="text-2xl sm:text-3xl font-bold">STUFF I MADE 🔥🔥🔥</span>
          {"\n=======\n"}
          <span className="text-2xl sm:text-3xl">Projects</span>
          {"\n>>>>>>> sage"}
        </pre>
      ) : (
        <Heading kicker="03 — projects">Things I've built.</Heading>
      )}
      <div className="grid sm:grid-cols-2 gap-4">
        {projects.map((p) => {
          const href = p.link || p.github;
          const Tag = href ? "a" : "div";
          return (
            <Tag
              key={p.title}
              {...(href ? { href, target: "_blank", rel: "noopener noreferrer" } : {})}
              className={`site-card group ${href ? "cursor-pointer" : ""}`}
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg font-semibold">{p.title}</h3>
                {href && <span className="site-muted group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">↗</span>}
              </div>
              <p className="mt-2 site-muted leading-relaxed text-[0.95rem]">{p.details}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {p.tags.map((t) => (
                  <span key={t} className="site-tag">
                    {t}
                  </span>
                ))}
              </div>
            </Tag>
          );
        })}
      </div>
    </div>
  );
}

export function Skills() {
  return (
    <div>
      <Heading kicker="04 — skills">The toolkit.</Heading>
      <ul className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-3">
        {SKILLS.map((s) => (
          <li key={s.name} className="site-card !p-3 flex flex-col items-center gap-2 text-center skill">
            <img src={s.logo} alt="" className="w-9 h-9 object-contain" />
            <span className="text-xs leading-tight">{s.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Hobbies() {
  return (
    <div>
      <Heading kicker="05 — hobbies">Outside the code.</Heading>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {HOBBIES.map((h) => (
          <figure key={h.title} className="site-card !p-0 overflow-hidden">
            <img src={h.image} alt={h.title} className="w-full aspect-[4/3] object-cover" />
            <figcaption className="p-4">
              <p className="font-semibold">{h.title}</p>
              <p className="site-muted text-sm mt-1 leading-relaxed">{h.text}</p>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

export function Contact() {
  const [copied, setCopied] = useState(null);
  const copy = (value, key) => {
    navigator.clipboard?.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied(null), 1200);
  };
  return (
    <div className="pb-6">
      <Heading kicker="06 — contact">Say hi.</Heading>
      <div className="flex flex-col sm:flex-row flex-wrap gap-3">
        <button onClick={() => copy(PROFILE.email, "mail")} className="site-btn">
          ✉ {PROFILE.email} <span className="site-muted text-sm">{copied === "mail" ? "✓ copied" : "copy"}</span>
        </button>
        <button onClick={() => copy(PROFILE.phone, "tel")} className="site-btn">
          ☎ {PROFILE.phone} <span className="site-muted text-sm">{copied === "tel" ? "✓ copied" : "copy"}</span>
        </button>
      </div>
      <div className="flex gap-3 mt-4">
        <a href={PROFILE.linkedin} target="_blank" rel="noopener noreferrer" className="site-btn">
          <img src={linkedinLogo} alt="" className="w-5 h-5" /> LinkedIn
        </a>
        <a href={PROFILE.github} target="_blank" rel="noopener noreferrer" className="site-btn">
          <img src={githubLogo} alt="" className="w-5 h-5 rounded" /> GitHub
        </a>
      </div>
    </div>
  );
}
