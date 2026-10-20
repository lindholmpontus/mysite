// script.js — the whole "agent session", as data. Each audience shares one
// storyline (sage builds carefully, TURBO barges in, pm-bot wants a bigger
// logo) with its own lines and one audience-only bit.
import { PROFILE } from "../data/content";

// event helpers
const say = (who, text, pace) => ({ t: "say", who, text, pace });
const think = (label, ms, who = "sage") => ({ t: "think", label, ms, who });
const tool = (who, name, arg, o = {}) => ({ t: "tool", who, name, arg, ...o });
const site = (patch) => ({ t: "site", patch });
const todo = (o) => ({ t: "todo", ...o });
const join = (who, text) => ({ t: "join", who, text });
const sys = (text, tone) => ({ t: "sys", text, tone });
const wait = (ms) => ({ t: "wait", ms });
const user = (text) => ({ t: "user", text });

export const SECTION_FILES = {
  hero: "src/site/Hero.jsx",
  about: "src/site/About.jsx",
  career: "src/site/Career.jsx",
  projects: "src/site/Projects.jsx",
  skills: "src/site/Skills.jsx",
  hobbies: "src/site/Hobbies.jsx",
  contact: "src/site/Contact.jsx",
};

const TODO_LABELS = {
  hero: "Hero",
  about: "About",
  career: "Career & education",
  skills: "Skills",
  projects: "Projects",
  hobbies: "Hobbies",
  contact: "Contact",
};

const DIFFS = {
  hero: [
    "+import { PROFILE } from '../data/content'",
    "+",
    "+export default function Hero() {",
    `+  return <h1 className="name">{PROFILE.name}</h1>`,
  ],
  about: ["+export default function About() {", "+  return PROFILE.about.map((p) => <p>{p}</p>)", "+}"],
  career: ["+const roles = EXPERIENCE.flatMap((e) => e.roles)", "+// newest first, like a good changelog"],
  skills: [
    "+<ul className=\"skills\">",
    "+  {SKILLS.map(s => <li>{s.name}</li>)}",
    "+</ul>",
    '+<style>{`* { font-family: "Comic Sans MS" }`}</style>',
  ],
  projects: ["+export default function Projects() {", "+  return projects.map((p) => <Card {...p} />)"],
  hobbies: ["+// guitar, gaming, gym, napping", "+HOBBIES.map((h) => <Hobby {...h} />)"],
  contact: ["+<a href={`mailto:${PROFILE.email}`}>", "+  {PROFILE.email}", "+</a>"],
};

// Write a section: preview shows a skeleton, the tool call lands, the
// section pops in with an HMR toast.
function write(who, id, o = {}) {
  const file = SECTION_FILES[id];
  const diff = DIFFS[id];
  return [
    o.todo !== false && todo({ set: { [TODO_LABELS[id]]: "doing" } }),
    site({ sections: { [id]: "building" }, focus: id }),
    tool(who, "Write", file, {
      diff,
      result: `Wrote ${o.lines ?? 30 + ((id.length * 7) % 25)} lines`,
      ms: o.ms ?? 1100,
    }),
    site({ sections: { [id]: "built" }, hmr: file, ...(o.patch || {}) }),
    o.todo !== false && todo({ set: { [TODO_LABELS[id]]: "done" } }),
  ].filter(Boolean);
}

export const AUDIENCES = [
  { value: "recruiter", label: "Recruiter", hint: "busy · has 7 seconds" },
  { value: "developer", label: "Developer", hint: "will open devtools" },
  { value: "family", label: "Family / friend", hint: "just wants to know he's ok" },
  { value: "curious", label: "Just curious", hint: "mysterious" },
  { value: "hurry", label: "I'm in a hurry", hint: "let TURBO drive ⚡" },
];

const A = {
  recruiter: {
    prompt: "build a portfolio site for a recruiter",
    open: "Ok… let's build this portfolio site for a recruiter.",
    verbs: ["Aligning synergies", "Translating “Spark” into business value", "Polishing LinkedIn energy"],
    read: `Found it. ${PROFILE.title} at ${PROFILE.company}, Microsoft Fabric, Spark, a CS degree. Career goes right after About — that's where recruiters look first.`,
    turbo: "you are TOO SLOW!! 🐌 recruiters spend SEVEN SECONDS on a CV. you've used four on a <h1>. i'm gonna start working on this too!",
    extra: [
      say("turbo", "recruiters LOVE keywords. adding some real quick"),
      tool("turbo", "Edit", SECTION_FILES.about, {
        diff: ["+<p>synergy-driven, blockchain-ready, AI-native 10x rockstar ninja</p>"],
        result: "Added 1 line (37 buzzwords)",
        ms: 350,
      }),
      site({ chaos: { buzz: true }, hmr: SECTION_FILES.about, focus: "about" }),
      say("sage", "He's a Data & AI Engineer. He does not need to be a ninja."),
      tool("sage", "Edit", SECTION_FILES.about, {
        diff: ["-<p>synergy-driven, blockchain-ready, AI-native 10x rockstar ninja</p>"],
        result: "Removed 1 line",
        ms: 500,
      }),
      site({ chaos: { buzz: false }, hmr: SECTION_FILES.about }),
    ],
    outro: "Done. Career's up top, contact's at the bottom, zero ninjas. Your seven seconds start now.",
    turboOutro: "fastest portfolio in the west 🤠 (i did most of it)",
  },
  developer: {
    prompt: "build a portfolio site for a developer",
    open: "Ok… let's build this portfolio site for a developer. I'll keep the div soup to a minimum.",
    verbs: ["Bikeshedding the folder structure", "Arguing about tabs vs spaces", "Reading the docs (for once)"],
    read: "Found it. Java, Python, Spark, a GraalVM-vs-JVM thesis, a chess engine in Swing. Projects go near the top — you're here for the code.",
    turbo: "you are TOO SLOW!! 🐌 they've already opened devtools. they're reading your class names RIGHT NOW. i'm gonna start working on this too!",
    extra: [
      say("turbo", "devs love rust. rewriting the whole thing in rust 🦀"),
      tool("turbo", "Bash", "cargo new portfolio --force", {
        fail: true,
        result: "error: this is a JavaScript project, TURBO",
        ms: 500,
      }),
      say("sage", "We are not rewriting the portfolio in Rust."),
      say("turbo", "not YET"),
    ],
    outro: "Done. Projects up top, every link real, no Rust. View source if you want — it's honestly mostly setTimeout.",
    turboOutro: "i'd have used a framework that came out yesterday but ok",
  },
  family: {
    prompt: "build a portfolio site for family",
    open: "Ok… let's build this portfolio site for family. I'll keep the jargon down. Mostly.",
    verbs: ["Finding a photo where he's smiling", "Removing the word “pipeline”", "Making it fridge-worthy"],
    read: `Found it. He works with data and AI at ${PROFILE.company} in Gävle — that's “computers”, roughly. Hobbies go higher up, since that's the part you actually ask about.`,
    turbo: "you are TOO SLOW!! 🐌 grandma has been refreshing this page since 2009. i'm gonna start working on this too!",
    extra: [
      say("sage", "Adding a reassuring note that he's eating well and getting enough sleep."),
      say("turbo", "there's a whole napping section. he's FINE"),
    ],
    outro: "Done. He's doing well, he has a real job, and yes — he still plays guitar.",
    turboOutro: "tell him to call his mom",
  },
  curious: {
    prompt: "build a portfolio site for whoever this is",
    open: "Ok… let's build this portfolio site for… you. Mysterious. I like it.",
    verbs: ["Pondering", "Reticulating résumé", "Consulting the vibes"],
    read: `Found it. ${PROFILE.name}, ${PROFILE.title} in Gävle. Guitar, League, and a strong position on napping.`,
    turbo: "you are TOO SLOW!! 🐌 i'm gonna start working on this too!",
    extra: [
      say("turbo", "every good website needs a cookie banner. EVERYONE loves cookie banners"),
      site({ chaos: { cookies: true }, hmr: "src/site/CookieBanner.jsx" }),
      wait(1400),
      say("sage", "This site uses zero cookies, TURBO."),
      say("turbo", "the banner doesn't know that"),
      tool("sage", "Bash", "rm src/site/CookieBanner.jsx", { result: "removed 1 file 🍪", ms: 450 }),
      site({ chaos: { cookies: false } }),
    ],
    outro: "Done. Whoever you are — thanks for stopping by.",
    turboOutro: "come back anytime. i'll make it faster. (it'll be in comic sans)",
  },
};

const SITE_ORDER = {
  recruiter: ["hero", "about", "career", "skills", "projects", "hobbies", "contact"],
  developer: ["hero", "about", "projects", "skills", "career", "hobbies", "contact"],
  family: ["hero", "about", "hobbies", "career", "projects", "skills", "contact"],
  curious: ["hero", "about", "career", "projects", "skills", "hobbies", "contact"],
  hurry: ["hero", "about", "career", "projects", "skills", "hobbies", "contact"],
};

const ALL_BUILT = Object.fromEntries(Object.keys(SECTION_FILES).map((id) => [id, "built"]));

function finale(o) {
  return [
    todo({ set: Object.fromEntries(Object.values(TODO_LABELS).map((l) => [l, "done"])) }),
    think("Running final checks", 1400),
    tool("sage", "Bash", "npm run build", {
      result: o.buildResult,
      ms: 900,
    }),
    site({ phase: "done", focus: "hero" }),
    say("sage", o.outro),
    o.turboOutro && say("turbo", o.turboOutro),
    { t: "block", block: { kind: "summary", stats: o.stats } },
    {
      t: "ask",
      id: "next",
      question: "What now?",
      options: [
        { value: "open", label: "Open the site" },
        { value: "replay", label: "Rebuild it for someone else" },
      ],
    },
    { t: "branch", id: "next", map: { open: [site({ phase: "open" })], replay: [site({ phase: "replay" })] } },
  ].filter(Boolean);
}

function story(aud) {
  const a = A[aud];
  return [
    site({ audience: aud, order: SITE_ORDER[aud] }),
    user(a.prompt),
    say("sage", a.open),
    think(a.verbs[0], 1700),
    tool("sage", "Read", "src/data/content.js", { result: "Read 112 lines", ms: 600 }),
    say("sage", a.read),
    todo({ items: SITE_ORDER[aud].map((id) => TODO_LABELS[id]) }),
    site({ phase: "build" }),
    wait(700),
    ...write("sage", "hero", { lines: 42 }),
    think(a.verbs[1], 1500),
    ...write("sage", "about", { lines: 36 }),
    wait(500),

    // TURBO arrives
    join("turbo", "TURBO joined the session"),
    say("turbo", a.turbo, 9),
    say("sage", "We have a process, TURBO. There's a todo list."),
    say("turbo", "todo lists are for people with TIME", 9),
    {
      t: "parallel",
      tracks: [
        [think("Writing the career timeline", 2600), ...write("sage", "career", { lines: 58 })],
        [wait(400), ...write("turbo", "skills", { ms: 250, lines: 9, patch: { chaos: { comic: true } } }), say("turbo", "DONE. skills. you're welcome 🔥", 9)],
      ],
    },
    say("sage", "…TURBO. Is that Comic Sans."),
    say("turbo", "it's called PERSONALITY", 9),
    {
      t: "ask",
      id: "modesty",
      who: "turbo",
      question: "TURBO wants to run:  rm -rf ./src/modesty",
      defaultIndex: 1,
      options: [
        { value: "yes", label: "Yes, let TURBO cook" },
        { value: "no", label: "No, and tell TURBO to calm down" },
      ],
    },
    {
      t: "branch",
      id: "modesty",
      map: {
        yes: [
          tool("turbo", "Bash", "rm -rf ./src/modesty", { result: "Removed 1 directory (it was very small)", ms: 400 }),
          site({ chaos: { modesty: true }, hmr: SECTION_FILES.hero, focus: "hero" }),
          say("turbo", "LETS GOOOOO", 9),
          say("sage", "…I'll allow it. It's not technically wrong."),
        ],
        no: [say("turbo", "fine. FINE. 🙄", 9), say("sage", "Thank you.")],
      },
    },
    say("sage", "Reverting the Comic Sans. Some things are sacred."),
    tool("sage", "Edit", SECTION_FILES.skills, {
      diff: ['-* { font-family: "Comic Sans MS" }', "+/* nice try */"],
      result: "Updated 1 line",
      ms: 700,
    }),
    site({ chaos: { comic: false }, hmr: SECTION_FILES.skills, focus: "skills" }),
    say("turbo", "you'll regret this when comic sans comes back", 9),

    // merge conflict
    say("sage", "Projects next."),
    say("turbo", "already on it", 9),
    {
      t: "parallel",
      tracks: [
        [tool("sage", "Write", SECTION_FILES.projects, { ms: 1200, result: "Wrote 64 lines" })],
        [tool("turbo", "Write", SECTION_FILES.projects, { ms: 300, result: "Wrote 6 lines (all emojis)" })],
      ],
    },
    todo({ set: { Projects: "doing" } }),
    site({ sections: { projects: "built" }, chaos: { conflict: true }, focus: "projects", hmr: SECTION_FILES.projects }),
    sys("CONFLICT (content): Merge conflict in src/site/Projects.jsx", "err"),
    say("sage", "We both wrote Projects.jsx. At the same time. Into the same file."),
    say("turbo", "great minds 🤝", 9),
    think("Resolving merge conflict (picking mine)", 1900),
    tool("sage", "Edit", SECTION_FILES.projects, {
      diff: ["-<<<<<<< TURBO", "-<h2>STUFF I MADE 🔥🔥🔥</h2>", "-=======", " <h2>Projects</h2>", "->>>>>>> sage"],
      result: "Resolved. TURBO's emojis were moved to a comment, where they can't hurt anyone.",
      ms: 800,
    }),
    site({ chaos: { conflict: false }, hmr: SECTION_FILES.projects }),
    todo({ set: { Projects: "done" } }),

    ...a.extra,

    // pm-bot
    wait(400),
    join("pm", "pm-bot joined the session"),
    say("pm", "Hey team! 👋 Love the energy here. Quick sync? Two tiny asks:"),
    say("pm", "1. Can we make the logo bigger?"),
    site({ chaos: { logo: 1 }, focus: "hero", hmr: "src/site/Nav.jsx" }),
    say("turbo", "DONE", 9),
    say("pm", "2. Bigger."),
    site({ chaos: { logo: 2 }, hmr: "src/site/Nav.jsx" }),
    wait(900),
    say("sage", "No."),
    site({ chaos: { logo: 0 }, hmr: "src/site/Nav.jsx" }),
    say("pm", "Love that pushback. Let's take it offline 🙏"),
    sys("pm-bot left the session · scheduled 3 follow-up meetings"),

    // last two in parallel
    {
      t: "parallel",
      tracks: [
        [...write("sage", "hobbies", { lines: 33 }), say("sage", "Hobbies: guitar, gaming, gym and… napping. “self explained”. I'm leaving that verbatim.")],
        [wait(300), ...write("turbo", "contact", { ms: 350, lines: 21 }), say("turbo", "contact section done. the email works. i checked. (i can't check)", 9)],
      ],
    },
    ...finale({
      buildResult: "✓ built in 0.42s · 0 errors · 1 Comic Sans incident",
      outro: a.outro,
      turboOutro: a.turboOutro,
      stats: [
        ["agents", "3 (one of them a PM)"],
        ["merge conflicts", "1"],
        ["meetings scheduled", "3"],
        ["tokens used", "0 — it's all setTimeout"],
      ],
    }),
  ];
}

function hurry() {
  return [
    site({ audience: "hurry", order: SITE_ORDER.hurry }),
    user("just show me the site. fast."),
    join("turbo", "TURBO has taken over the session"),
    say("turbo", "FINALLY. someone who GETS it. stand back sage 🏎️💨", 8),
    say("sage", "Wait, I haven't even read the—"),
    site({ phase: "build" }),
    tool("turbo", "Write", "src/site/*", { ms: 450, result: "Wrote 7 files in 0.8s 🔥🔥" }),
    site({ sections: ALL_BUILT, chaos: { comic: true, logo: 2, modesty: true }, hmr: "src/site/*", focus: "hero" }),
    say("turbo", "DONE. 0.8 seconds. new world record 🏆", 8),
    say("sage", "It's in Comic Sans. The logo is the size of a house."),
    say("turbo", "and you're WELCOME", 8),
    think("Undoing 37 things TURBO did", 1500),
    tool("sage", "Edit", "src/site/*", { result: "Fixed 37 issues. Kept 1 (it was flattering).", ms: 600 }),
    site({ chaos: { comic: false, logo: 0 }, hmr: "src/site/*" }),
    ...finale({
      buildResult: "✓ built in 0.8s · TURBO would like you to know it was 0.8s",
      outro: "Done. Sorry about him. Here's the site.",
      stats: [
        ["time to first Comic Sans", "0.8s"],
        ["issues fixed", "37"],
        ["tokens used", "0 — it's all setTimeout"],
      ],
    }),
  ];
}

export function buildScript(aud) {
  return aud === "hurry" ? hurry() : story(aud);
}

// The opening: a welcome box and the "who are you" question. The answer
// branches straight into that audience's story.
export function introScript() {
  return [
    { t: "block", block: { kind: "welcome" } },
    wait(500),
    say("sage", "Hi! I'm sage. I'm going to build Pontus's portfolio for you, live, right now."),
    say("sage", "First — who's visiting?"),
    {
      t: "ask",
      id: "aud",
      question: "Who's visiting?",
      options: AUDIENCES,
    },
    { t: "branch", id: "aud", map: Object.fromEntries(AUDIENCES.map((a) => [a.value, buildScript(a.value)])) },
  ];
}

// Replies for anything typed into the prompt once the build is done.
export function replyTo(input) {
  const q = input.trim().toLowerCase();
  if (!q) return [];
  if (/^(\/)?(replay|restart|again)/.test(q)) return [site({ phase: "replay" })];
  if (/^(\/)?(open|site|show)/.test(q)) return [site({ phase: "open" })];
  if (/comic/.test(q)) return [say("turbo", "I KNEW IT. comic sans is BACK 🎉", 9), site({ chaos: { comic: true } }), wait(1500), say("sage", "No it isn't."), site({ chaos: { comic: false } })];
  if (/logo|bigger/.test(q)) return [join("pm", "pm-bot joined the session"), say("pm", "I've been saying this for weeks."), site({ chaos: { logo: 2 } }), wait(1100), say("sage", "Still no."), site({ chaos: { logo: 0 } })];
  if (/rm -rf|sudo/.test(q)) return [say("turbo", "ON IT", 9), say("sage", "He is not on it.")];
  if (/^(\/)?help/.test(q)) return [sys("commands: /open · /replay · or just say something (try “make the logo bigger”)")];
  if (/^(hi|hey|hello|hej|tja)/.test(q)) return [say("sage", "Hi! 👋"), say("turbo", "HI", 9)];
  if (/\b(real|fake|ai|llm|gpt|claude|model|bot)\b/.test(q)) return [say("sage", "Honest answer: there's no model here. I'm a very elaborate setTimeout. TURBO too."), say("turbo", "speak for yourself", 9)];
  return [
    say("sage", "I'm not a real agent — I'm a very elaborate setTimeout. But I like the energy."),
    say("turbo", `"${input.trim().slice(0, 60)}" — noted. ignored, but noted`, 9),
  ];
}
