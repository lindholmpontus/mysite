// Site.jsx — the portfolio as the agents have built it so far. Sections
// that haven't been started don't render; ones being written show a
// skeleton; chaos flags restyle things until sage reverts them.
import React from "react";
import { Hero, About, Career, Projects, Skills, Hobbies, Contact } from "./sections";

const SECTION_COMPONENTS = { hero: Hero, about: About, career: Career, projects: Projects, skills: Skills, hobbies: Hobbies, contact: Contact };

const DEFAULT_ORDER = ["hero", "about", "career", "projects", "skills", "hobbies", "contact"];

function Skeleton() {
  return (
    <div className="py-4 space-y-3" aria-hidden>
      <div className="skel h-3 w-24" />
      <div className="skel h-9 w-2/3" />
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
      <div className="max-w-5xl mx-auto px-5 sm:px-8 h-14 flex items-center justify-between">
        <span
          className="site-logo"
          style={{ transform: `scale(${[1, 2.6, 7][logo]})`, zIndex: logo ? 30 : undefined }}
          aria-label="Pontus Lindholm"
        >
          PL
        </span>
        <nav className="hidden sm:flex gap-5 text-sm site-muted">
          {order
            .filter((id) => id !== "hero" && built[id] === "built")
            .map((id) => (
              <a key={id} href={`#${id}`} className="hover:opacity-100 capitalize" data-nav={id}>
                {id}
              </a>
            ))}
        </nav>
      </div>
    </header>
  );
}

export default function Site({ site, onNav }) {
  const { sections, chaos } = site;
  const order = site.order || DEFAULT_ORDER;
  const started = order.filter((id) => sections[id]);
  const done = site.phase === "done" || site.phase === "open";

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
      {chaos.comic && (
        <div className="chaos-marquee" aria-hidden>
          <span>🔥 BLAZINGLY FAST 🔥 BUILT BY TURBO 🔥 BLAZINGLY FAST 🔥 NO TESTS 🔥 BLAZINGLY FAST 🔥 BUILT BY TURBO 🔥 SHIP IT 🔥&nbsp;</span>
        </div>
      )}
      <Nav chaos={chaos} order={order} built={sections} />

      {started.length === 0 && (
        <div className="h-[70vh] grid place-items-center text-center px-6">
          <div>
            <p className="site-kicker">localhost:5173</p>
            <p className="mt-3 site-muted">Nothing here yet. The agents are thinking.</p>
          </div>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-5 sm:px-8">
        {started.map((id) => {
          const C = SECTION_COMPONENTS[id];
          return (
            <section key={id} id={id} data-sec={id} className={`py-10 sm:py-14 ${id !== "hero" ? "border-t site-border" : ""}`}>
              {sections[id] === "building" ? (
                <Skeleton />
              ) : (
                <div className="animate-rise">
                  <C chaos={chaos} />
                </div>
              )}
            </section>
          );
        })}
      </main>

      {done && (
        <footer className="max-w-5xl mx-auto px-5 sm:px-8 py-10 border-t site-border text-sm site-muted flex flex-wrap gap-x-6 gap-y-2 justify-between">
          <span>© {new Date().getFullYear()} Pontus Lindholm</span>
          <span>
            built by <b style={{ color: "var(--sage-ink)" }}>sage</b> · sped up by <b style={{ color: "var(--turbo)" }}>TURBO</b> · logo size
            approved by <b style={{ color: "var(--pm-ink)" }}>nobody</b>
          </span>
        </footer>
      )}

      {chaos.cookies && (
        <div className="cookie animate-pop">
          <p className="font-semibold">🍪 We value your privacy</p>
          <p className="text-sm site-muted mt-1">This site uses 47 cookies to give you the best possible cookie experience.</p>
          <div className="flex gap-2 mt-3">
            <span className="site-btn !py-1.5 text-sm">Accept all</span>
            <span className="site-btn !py-1.5 text-sm">Accept all</span>
          </div>
        </div>
      )}
    </div>
  );
}
