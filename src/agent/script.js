// script.js — the whole "agent session", as data. Each audience shares one
// storyline (sage is slow and summons TURBO, TURBO overdoes it and summons
// pm-bot, pm-bot wants a bigger logo) with its own lines and one extra bit.
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

// Write a section: the browser shows a skeleton, the tool call lands, the
// section pops in with an HMR toast. Diffs only where they're the joke.
function write(who, id, o = {}) {
  const file = SECTION_FILES[id];
  return [
    todo({ set: { [TODO_LABELS[id]]: "doing" } }),
    site({ sections: { [id]: "building" }, focus: id }),
    tool(who, "Write", file, { diff: o.diff, result: o.result || `Wrote ${o.lines ?? 40} lines`, ms: o.ms ?? 1300 }),
    site({ sections: { [id]: "built" }, hmr: file, ...(o.patch || {}) }),
    todo({ set: { [TODO_LABELS[id]]: "done" } }),
  ];
}

// someone runs the summon command and a new agent shows up
const summon = (by, who, cmd, result) => [
  tool(by, "Bash", cmd, { result, ms: 1500 }),
  join(who, `${who === "turbo" ? "TURBO" : "pm-bot"} joined the session`),
];

export const AUDIENCES = [
  { value: "recruiter", label: "Recruiter", hint: "busy · has 7 seconds" },
  { value: "developer", label: "Developer", hint: "will open devtools" },
  { value: "family", label: "Family / friend", hint: "just wants to know he's ok" },
  { value: "curious", label: "Just curious", hint: "mysterious" },
  { value: "hurry", label: "I'm in a hurry", hint: "skip the small talk" },
];

const A = {
  recruiter: {
    prompt: "build a portfolio site for a recruiter",
    open: "Ok… let's build this portfolio site for a recruiter.",
    verb: "Translating “Spark” into business value",
    turbo: "YOU RANG?? 🏎️ oh wow, a recruiter's waiting and you're on the ABOUT section?? move over",
    extra: [
      say("turbo", "recruiters LOVE keywords. adding some real quick", 9),
      site({ chaos: { buzz: true }, hmr: SECTION_FILES.about, focus: "about" }),
      say("sage", "He's a Data & AI Engineer. He does not need to be a ninja."),
      site({ chaos: { buzz: false }, hmr: SECTION_FILES.about }),
    ],
    outro: "Done. Career's near the top, contact's at the bottom, zero ninjas. Your seven seconds start now.",
    turboOutro: "fastest portfolio in the west 🤠",
  },
  developer: {
    prompt: "build a portfolio site for a developer",
    open: "Ok… let's build this portfolio site for a developer. Minimal div soup, I promise.",
    verb: "Bikeshedding the folder structure",
    turbo: "YOU RANG?? 🏎️ a dev is watching and you're still on the About section?? they've opened devtools, move over",
    extra: [
      say("turbo", "devs love rust. rewriting the whole thing in rust 🦀", 9),
      tool("turbo", "Bash", "cargo new portfolio --force", { fail: true, result: "error: this is a JavaScript project, TURBO", ms: 600 }),
      say("sage", "We are not rewriting it in Rust."),
    ],
    outro: "Done. Projects up top, every link is real. View source if you like — it's mostly setTimeout.",
    turboOutro: "would've been faster in rust",
  },
  family: {
    prompt: "build a portfolio site for family",
    open: "Ok… let's build this portfolio site for family. I'll keep the jargon down. Mostly.",
    verb: "Finding a photo where he's smiling",
    turbo: "YOU RANG?? 🏎️ grandma has been refreshing this page since 2009, move over",
    extra: [
      say("sage", "I'll add a note that he's eating well and sleeping enough."),
      say("turbo", "there's a whole NAPPING section. he's fine", 9),
    ],
    outro: "Done. He's doing well, he has a real job, and yes — he still plays guitar.",
    turboOutro: "tell him to call his mom",
  },
  curious: {
    prompt: "build a portfolio site for whoever this is",
    open: "Ok… let's build this portfolio site for… you. Mysterious. I like it.",
    verb: "Consulting the vibes",
    turbo: "YOU RANG?? 🏎️ ugh, you've done TWO sections. move over",
    extra: [
      say("turbo", "every website needs a cookie banner. EVERYONE loves cookie banners", 9),
      site({ chaos: { cookies: true }, hmr: "src/site/CookieBanner.jsx" }),
      wait(1400),
      say("sage", "This site has zero cookies, TURBO."),
      site({ chaos: { cookies: false } }),
    ],
    outro: "Done. Whoever you are — thanks for stopping by.",
    turboOutro: "come back anytime. it'll be in comic sans",
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
    tool("sage", "Bash", "npm run build", { result: o.buildResult, ms: 1200 }),
    site({ phase: "done", focus: "hero" }),
    say("sage", o.outro),
    o.turboOutro && say("turbo", o.turboOutro, 9),
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
    tool("sage", "Read", "src/data/content.js", { result: "Read 112 lines", ms: 900 }),
    todo({ items: SITE_ORDER[aud].map((id) => TODO_LABELS[id]) }),
    site({ phase: "build" }),
    ...write("sage", "hero", { ms: 1700 }),
    think(a.verb, 2000),
    ...write("sage", "about", { ms: 1900 }),

    // sage is slow today and calls for backup
    think("Writing the career section", 2600),
    say("sage", "Hmm. Dang it, I'm slow today. I'm going to summon some help."),
    ...summon("sage", "turbo", "npx summon-agent --fastest", "Installed 1 agent (437 dependencies, 12 vulnerabilities)"),
    say("turbo", a.turbo, 9),
    say("sage", "Just help with the skills section. Please."),
    {
      t: "parallel",
      tracks: [
        write("sage", "career", { ms: 2600 }),
        write("turbo", "skills", {
          ms: 300,
          diff: ['+* { font-family: "Comic Sans MS" !important }'],
          result: "Wrote 9 lines in 0.3s",
          patch: { chaos: { comic: true } },
        }),
      ],
    },
    say("sage", "…TURBO. Is that Comic Sans?"),
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
          site({ chaos: { modesty: true }, hmr: SECTION_FILES.hero, focus: "hero" }),
          say("turbo", "LETS GOOOOO", 9),
          say("sage", "…fine. It's not technically wrong."),
        ],
        no: [say("turbo", "fine. FINE. 🙄", 9)],
      },
    },
    tool("sage", "Edit", SECTION_FILES.skills, { result: "Removed Comic Sans. Some things are sacred.", ms: 900 }),
    site({ chaos: { comic: false }, hmr: SECTION_FILES.skills, focus: "skills" }),

    // both grab Projects.jsx
    say("sage", "I'll take Projects."),
    say("turbo", "already on it", 9),
    todo({ set: { Projects: "doing" } }),
    {
      t: "parallel",
      tracks: [
        [tool("sage", "Write", SECTION_FILES.projects, { ms: 1500, result: "Wrote 64 lines" })],
        [tool("turbo", "Write", SECTION_FILES.projects, { ms: 300, result: "Wrote 6 lines (all emojis)" })],
      ],
    },
    site({ sections: { projects: "built" }, chaos: { conflict: true }, focus: "projects", hmr: SECTION_FILES.projects }),
    sys("CONFLICT: both agents wrote src/site/Projects.jsx", "err"),
    say("turbo", "great minds 🤝", 9),
    think("Resolving the merge conflict (picking mine)", 2000),
    tool("sage", "Edit", SECTION_FILES.projects, { result: "Resolved. TURBO's emojis now live in a comment.", ms: 600 }),
    site({ chaos: { conflict: false }, hmr: SECTION_FILES.projects }),
    todo({ set: { Projects: "done" } }),

    ...a.extra,

    // TURBO decides the team needs a PM
    say("turbo", "you know what this team needs? MANAGEMENT", 9),
    say("sage", "No. Don't—"),
    ...summon("turbo", "pm", "npx summon-agent --role=product-manager", "Installed 1 agent (it already booked a meeting)"),
    say("pm", "Hey team! 👋 Love the energy. Tiny ask: can we make the logo bigger?"),
    site({ chaos: { logo: 1 }, focus: "hero", hmr: "src/site/Nav.jsx" }),
    wait(900),
    say("pm", "Bigger."),
    site({ chaos: { logo: 2 }, hmr: "src/site/Nav.jsx" }),
    wait(1000),
    say("sage", "No."),
    site({ chaos: { logo: 0 }, hmr: "src/site/Nav.jsx" }),
    sys("pm-bot left the session · scheduled 3 follow-up meetings"),

    {
      t: "parallel",
      tracks: [write("sage", "hobbies", { ms: 1800 }), [wait(300), ...write("turbo", "contact", { ms: 400 })]],
    },
    ...finale({
      buildResult: "✓ built in 0.42s · 1 Comic Sans incident",
      outro: a.outro,
      turboOutro: a.turboOutro,
      stats: [
        ["agents", "3 (one of them a PM)"],
        ["merge conflicts", "1"],
        ["tokens used", "0 — it's all setTimeout"],
      ],
    }),
  ];
}

function hurry() {
  return [
    site({ audience: "hurry", order: SITE_ORDER.hurry }),
    user("just show me the site. fast."),
    say("sage", "Fast isn't really my thing. Let me get someone who's… enthusiastic."),
    ...summon("sage", "turbo", "npx summon-agent --fastest", "Installed 1 agent (437 dependencies, 12 vulnerabilities)"),
    say("turbo", "FINALLY. someone who GETS it 🏎️💨", 8),
    site({ phase: "build" }),
    tool("turbo", "Write", "src/site/*", { ms: 500, result: "Wrote 7 files in 0.8s 🔥" }),
    site({ sections: ALL_BUILT, chaos: { comic: true, logo: 2, modesty: true }, hmr: "src/site/*", focus: "hero" }),
    say("turbo", "DONE. new world record 🏆", 8),
    say("sage", "It's in Comic Sans and the logo is the size of a house. One second."),
    think("Undoing 37 things TURBO did", 1600),
    site({ chaos: { comic: false, logo: 0 }, hmr: "src/site/*" }),
    ...finale({
      buildResult: "✓ built in 0.8s (TURBO wants you to know)",
      outro: "Done. Sorry about him. Kept one thing he added — it was flattering.",
      stats: [
        ["time to first Comic Sans", "0.8s"],
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
    say("sage", "Hi! I'm sage. I'll build Pontus's portfolio for you, live. Who's visiting?"),
    { t: "ask", id: "aud", question: "Who's visiting?", options: AUDIENCES },
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
  if (/logo|bigger/.test(q)) return [join("pm", "pm-bot joined the session"), say("pm", "I've been saying this for weeks."), site({ chaos: { logo: 2 } }), wait(1100), say("sage", "Still no."), site({ chaos: { logo: 0 } }), sys("pm-bot left the session")];
  if (/rm -rf|sudo/.test(q)) return [say("turbo", "ON IT", 9), say("sage", "He is not on it.")];
  if (/^(\/)?help/.test(q)) return [sys("commands: /open · /replay · or just say something (try “make the logo bigger”)")];
  if (/^(hi|hey|hello|hej|tja)\b/.test(q)) return [say("sage", "Hi! 👋"), say("turbo", "HI", 9)];
  if (/\b(real|fake|ai|llm|gpt|claude|model|bot)\b/.test(q)) return [say("sage", "Honest answer: there's no model here. I'm a very elaborate setTimeout. TURBO too."), say("turbo", "speak for yourself", 9)];
  return [
    say("sage", "I'm not a real agent — I'm a very elaborate setTimeout. But I like the energy."),
    say("turbo", `"${input.trim().slice(0, 60)}" — noted. ignored, but noted`, 9),
  ];
}
