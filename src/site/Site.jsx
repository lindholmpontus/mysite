// Site.jsx — the portfolio as the agents have built it so far, in the old
// journey's look: a starfield, the Sun cresting the hero, and one planet
// beside each section. Sections that haven't been started don't render;
// ones being written show a skeleton; chaos flags restyle things until
// sage reverts them.
import React from "react";
import { Hero, About, Career, Projects, Skills, Hobbies, Contact } from "./sections";
import { Planet, Sun } from "./Planet";
import { SPACE } from "./space";

const SECTION_COMPONENTS = { about: About, career: Career, projects: Projects, skills: Skills, hobbies: Hobbies, contact: Contact };
const DEFAULT_ORDER = ["hero", "about", "career", "projects", "skills", "hobbies", "contact"];

function Skeleton() {
  return (
    <div className="space-y-3 py-6" aria-hidden>
      <div className="skel h-3 w-24" />
      <div className="skel h-8 w-2/3" />
      <div className="skel h-3 w-full mt-6" />
      <div className="skel h-3 w-5/6" />
      <div className="skel h-3 w-4/6" />
    </div>
  );
}

function Nav({ chaos, order, built }) {
  const logo = chaos.logo || 0;
  return (
    <header className="site-nav">
      <div className="max-w-7xl mx-auto px-5 sm:px-10 h-14 flex items-center justify-between">
        <img
          src="/logo.svg"
          alt="Pontus Lindholm"
          className="site-logo"
          style={{ transform: `scale(${[1, 2.6, 7][logo]})`, zIndex: logo ? 30 : undefined }}
        />
        <nav className="hidden sm:flex gap-6 font-space text-[10px] tracking-[0.28em] uppercase text-white/50">
          {order
            .filter((id) => id !== "hero" && built[id] === "built")
            .map((id) => (
              <a key={id} href={`#${id}`} className="hover:text-white transition-colors" data-nav={id}>
                {id}
              </a>
            ))}
        </nav>
      </div>
    </header>
  );
}

// title row in the old style: number, glowing rule, planet name; while the
// agents fight over Projects.jsx the merge conflict replaces it
function SectionHeader({ id, num, chaos }) {
  const s = SPACE[id];
  if (id === "projects" && chaos.conflict) {
    return (
      <pre className="site-conflict">
        {"<<<<<<< TURBO\n"}
        <span className="text-2xl sm:text-3xl font-bold">STUFF I MADE 🔥🔥🔥</span>
        {"\n=======\n"}
        <span className="text-2xl sm:text-3xl">PROJECTS</span>
        {"\n>>>>>>> sage"}
      </pre>
    );
  }
  return (
    <header>
      <div className="flex items-center gap-4 font-space text-[11px] tracking-[0.35em] uppercase">
        <span style={{ color: s.accent, textShadow: `0 0 12px ${s.accent}` }}>{num}</span>
        <span className="h-px w-14" style={{ background: s.accent, boxShadow: `0 0 8px ${s.accent}` }} />
        <span className="text-white/40">{s.planet}</span>
      </div>
      <h2
        className="font-display uppercase text-3xl sm:text-5xl leading-tight tracking-[0.06em] mt-5 text-white site-h2"
        style={{ textShadow: `0 0 44px ${s.accent}40` }}
      >
        {s.title}
      </h2>
      {s.subtitle && <p className="font-space text-xs text-white/45 mt-3 uppercase tracking-[0.25em]">{s.subtitle}</p>}
    </header>
  );
}

function PlanetSection({ id, index, status, chaos }) {
  const s = SPACE[id];
  const C = SECTION_COMPONENTS[id];
  const num = String(index).padStart(2, "0");
  const planetLeft = index % 2 === 1;
  return (
    <section id={id} data-sec={id} className="relative">
      <div className="mx-auto max-w-7xl px-5 sm:px-10 py-14 lg:py-24 lg:grid lg:grid-cols-2 lg:gap-14 lg:items-center">
        <div className={`flex justify-center mb-10 lg:mb-0 ${planetLeft ? "lg:order-1" : "lg:order-2"}`}>
          <div className="relative w-[min(70vw,300px)] lg:w-[min(100%,380px)] aspect-square">
            <span className="reticle" style={{ "--accent": s.accent }} aria-hidden>
              <i />
              <i />
              <i />
              <i />
            </span>
            <p
              className="absolute -top-8 inset-x-0 text-center font-space text-[10px] tracking-[0.28em] uppercase whitespace-nowrap"
              style={{ color: s.accent, textShadow: `0 0 10px ${s.accent}` }}
            >
              ◈ {status === "built" ? "Recovered" : "Scanning"} · {num} {s.title}
            </p>
            <div className={`absolute inset-[12%] transition-opacity duration-700 ${status === "built" ? "opacity-100" : "opacity-30"}`}>
              <Planet {...s} />
            </div>
          </div>
        </div>
        <article className={`relative isolate ${planetLeft ? "lg:order-2" : "lg:order-1"}`}>
          <div aria-hidden className="text-pool" />
          {status === "building" ? (
            <Skeleton />
          ) : (
            <div className="animate-rise">
              <SectionHeader id={id} num={num} chaos={chaos} />
              <div className="mt-9">
                <C accent={s.accent} chaos={chaos} />
              </div>
            </div>
          )}
        </article>
      </div>
    </section>
  );
}

export default function Site({ site, onNav }) {
  const { sections, chaos } = site;
  const order = site.order || DEFAULT_ORDER;
  const started = order.filter((id) => sections[id]);
  const done = site.phase === "done" || site.phase === "open";
  const planets = started.filter((id) => id !== "hero");

  return (
    <div
      className={`site min-h-full ${chaos.comic ? "chaos-comic" : ""}`}
      onClick={(e) => {
        const a = e.target.closest("a[data-nav]");
        if (a && onNav) {
          e.preventDefault();
          onNav(a.dataset.nav);
        }
      }}
    >
      <div className="space-sky" aria-hidden />
      <div className="space-stars" aria-hidden />

      {chaos.comic && (
        <div className="chaos-marquee" aria-hidden>
          <span>🔥 BLAZINGLY FAST 🔥 BUILT BY TURBO 🔥 BLAZINGLY FAST 🔥 NO TESTS 🔥 BLAZINGLY FAST 🔥 BUILT BY TURBO 🔥 SHIP IT 🔥&nbsp;</span>
        </div>
      )}
      <Nav chaos={chaos} order={order} built={sections} />

      {started.length === 0 && (
        <div className="relative h-[70vh] grid place-items-center text-center px-6">
          <div>
            <p className="font-space text-[10px] tracking-[0.3em] uppercase text-white/40">localhost:5173</p>
            <p className="mt-3 text-white/50 font-light">Nothing here yet. The agents are thinking.</p>
          </div>
        </div>
      )}

      <main className="relative">
        {started.map((id) => {
          if (id === "hero") {
            return (
              <section key={id} id={id} data-sec={id} className="relative h-[88vh] min-h-[520px] overflow-hidden flex items-center justify-center -mt-14">
                {sections.hero === "building" ? (
                  <div className="w-2/3 max-w-xl">
                    <Skeleton />
                  </div>
                ) : (
                  <>
                    <div className="sun-slot" aria-hidden>
                      <Sun />
                    </div>
                    <div className="hero-fade" aria-hidden />
                    <div className="animate-rise -mt-[10vh]">
                      <Hero chaos={chaos} />
                    </div>
                  </>
                )}
              </section>
            );
          }
          return <PlanetSection key={id} id={id} index={planets.indexOf(id) + 1} status={sections[id]} chaos={chaos} />;
        })}
      </main>

      {done && (
        <footer className="relative max-w-7xl mx-auto px-5 sm:px-10 py-14 text-center">
          <p className="font-space text-[11px] tracking-[0.2em] uppercase text-white/50">
            built by <b style={{ color: "var(--sage)" }}>sage</b> · sped up by <b style={{ color: "var(--turbo)" }}>TURBO</b> · logo size approved by{" "}
            <b style={{ color: "var(--pm)" }}>nobody</b>
          </p>
          <p className="font-space text-[9px] tracking-[0.2em] uppercase text-white/25 mt-6">
            © {new Date().getFullYear()} Pontus Lindholm · Planet & sky textures:{" "}
            <a href="https://www.solarsystemscope.com/textures/" target="_blank" rel="noopener noreferrer" className="underline decoration-white/20 hover:text-white/60">
              Solar System Scope
            </a>{" "}
            (based on NASA imagery) ·{" "}
            <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer" className="underline decoration-white/20 hover:text-white/60">
              CC BY 4.0
            </a>{" "}
            · modified
          </p>
        </footer>
      )}

      {chaos.cookies && (
        <div className="cookie animate-pop">
          <p className="font-semibold">🍪 We value your privacy</p>
          <p className="text-sm text-white/60 mt-1">This site uses 47 cookies to give you the best possible cookie experience.</p>
          <div className="flex gap-2 mt-3">
            <span className="cookie-btn">Accept all</span>
            <span className="cookie-btn">Accept all</span>
          </div>
        </div>
      )}
    </div>
  );
}
