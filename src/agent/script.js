// script.js — the whole "agent session", as data. Each audience shares one
// storyline (sage is slow and summons TURBO, TURBO overdoes it and summons
// pm-bot, pm-bot's roadmap fills sage's context, TURBO "fixes" the tests)
// with its own lines and one extra bit.

// event helpers
const say = (who, text, pace) => ({ t: "say", who, text, pace });
// label can be a list: the spinner steps through it once over `ms`
const think = (label, ms, o = {}) => ({ t: "think", label, ms, who: "sage", ...o });
const tool = (who, name, arg, o = {}) => ({ t: "tool", who, name, arg, ...o });
const site = (patch) => ({ t: "site", patch });
const todo = (o) => ({ t: "todo", ...o });
const join = (who, text) => ({ t: "join", who, text });
const sys = (text, tone) => ({ t: "sys", text, tone });
const wait = (ms) => ({ t: "wait", ms });
const user = (text) => ({ t: "user", text });

// sage's opening line, repeated word for word when the context gets wiped
const HELLO = "Hi! I'm sage. I'll build Pontus's portfolio for you, live. Who's visiting?";

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
const summonTurbo = (by) =>
  summon(by, "turbo", "npx summon-agent --fastest", "added 1 agent and 437 dependencies · 12 critical vulnerabilities");

export const AUDIENCES = [
  { value: "recruiter", label: "Recruiter" },
  { value: "developer", label: "Developer" },
  { value: "family", label: "Family / friend" },
  { value: "curious", label: "Just curious" },
  { value: "hurry", label: "I'm in a hurry" },
];

const A = {
  recruiter: {
    prompt: "build a portfolio site for a recruiter",
    open: "Ok… let's build this portfolio site for a recruiter. Scannable. No walls of text.",
    verb: ["Translating “Spark” into business value", "Removing the word “passionate”"],
    turbo: "a recruiter is waiting and you're on section TWO? move over",
    extra: [
      say("turbo", "recruiters filter on years of experience. adding some", 9),
      site({ chaos: { years: true }, hmr: SECTION_FILES.about, focus: "about" }),
      wait(900),
      say("sage", "Microsoft Fabric came out in 2023."),
      say("turbo", "time zones", 9),
      tool("sage", "Edit", SECTION_FILES.about, { result: "Removed 1 hallucination (not mine)", ms: 700 }),
      site({ chaos: { years: false }, hmr: SECTION_FILES.about }),
    ],
    outro: "Done. Career right after About, contact at the end, zero hallucinations. Your seven seconds start now.",
    turboOutro: "also hid the word “synergy” in white text. you'll never find it",
  },
  developer: {
    prompt: "build a portfolio site for a developer",
    open: "Ok… let's build this portfolio site for a developer. Semantic HTML. I promise.",
    verb: ["Bikeshedding the folder structure", "Renaming utils.js to helpers.js"],
    turbo: "a dev is watching and you're on section TWO? they've already opened devtools. move over",
    extra: [
      say("turbo", "devs love options. adding a light mode", 9),
      site({ chaos: { light: true }, hmr: "src/site/theme.css" }),
      wait(1300),
      say("sage", "You flashbanged a developer."),
      site({ chaos: { light: false }, hmr: "src/site/theme.css" }),
      say("sage", "It's space, TURBO. Space doesn't have a light mode."),
      say("turbo", "the sun does", 9),
    ],
    outro: "Done. Every project link is real. View source if you like — it's mostly setTimeout.",
    turboOutro: "lighthouse score is 100. didn't run it. i can just tell",
  },
  family: {
    prompt: "build a portfolio site for family",
    open: "Ok… let's build this portfolio site for family. I'll keep the jargon down. Mostly.",
    verb: ["Finding a photo where he's smiling", "Still looking"],
    turbo: "grandma has been refreshing this page since 2009. move over",
    extra: [
      say("sage", "I'll add a note that he's eating well and sleeping enough."),
      say("turbo", "there's a whole section about napping. he's thriving", 9),
      say("turbo", "should we add the baby photos", 9),
      say("sage", "No."),
      say("turbo", "too late. they're in the git history forever", 9),
    ],
    outro: "Done. He's doing well, he has a real job, and yes — he still plays guitar.",
    turboOutro: "tell him to call his mom",
  },
  curious: {
    prompt: "build a portfolio site for whoever this is",
    open: "Ok… let's build this portfolio site for… you. Mysterious. I like it.",
    verb: ["Consulting the vibes", "Vibes inconclusive"],
    turbo: "two sections?? i'd have shipped, pivoted and burned out by now. move over",
    extra: [
      say("turbo", "every website needs a cookie banner. it's the law. probably", 9),
      site({ chaos: { cookies: true }, hmr: "src/site/CookieBanner.jsx" }),
      wait(1400),
      say("sage", "This site has zero cookies, TURBO."),
      site({ chaos: { cookies: false } }),
    ],
    outro: "Done. Whoever you are — thanks for stopping by.",
    turboOutro: "come back anytime. it'll be in comic sans",
  },
};

// one order for everyone: the planets' order in the solar system, so the
// glimpse on the monitor matches the 3D journey it zooms into
const ORDER = ["hero", "about", "career", "projects", "skills", "hobbies", "contact"];

const ALL_BUILT = Object.fromEntries(Object.keys(SECTION_FILES).map((id) => [id, "built"]));

// what TURBO does with "rm -rf ./src/modesty", by permission answer
const removeModesty = [
  tool("turbo", "Bash", "rm -rf ./src/modesty", {
    result: "removed src/modesty/ (3 files, mostly “it was a team effort”)",
    ms: 400,
  }),
  site({ chaos: { modesty: true }, hmr: SECTION_FILES.hero, focus: "hero" }),
  say("sage", "…Fine. At least it cites its source."),
];

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
    site({ audience: aud, order: ORDER }),
    user(a.prompt),
    say("sage", a.open),
    tool("sage", "Read", "src/data/content.js", { result: "Read 107 lines", ms: 900 }),
    todo({ items: ORDER.map((id) => TODO_LABELS[id]) }),
    site({ phase: "build" }),
    ...write("sage", "hero", { ms: 1700 }),
    think(a.verb, 2800),
    ...write("sage", "about", { ms: 1900 }),

    // sage is slow today and calls for backup
    think(
      ["Writing the career section", "Rewriting the career section", "Rethinking the career section", "Considering a career change"],
      3600,
      { from: 251 }
    ),
    say("sage", "This is taking a while. I'm calling in help. Against my better judgment."),
    ...summonTurbo("sage"),
    say("turbo", a.turbo, 9),
    say("sage", "Just the Skills section. Please."),
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
    say("sage", "…Why is everything wobbling?"),
    tool("sage", "Bash", "git blame src/site/Skills.jsx", { result: "TURBO · 4 seconds ago · “small font fix”", ms: 700 }),
    say("turbo", "it tested really well", 9),
    say("sage", "With who?"),
    say("turbo", "me", 9),
    say("turbo", "ok one more small fix", 9),
    {
      t: "ask",
      id: "modesty",
      who: "turbo",
      question: "TURBO wants to run:  rm -rf ./src/modesty",
      defaultIndex: 2,
      options: [
        { value: "yes", label: "Yes" },
        { value: "always", label: "Yes, and don't ask again for rm -rf" },
        { value: "no", label: "No, and tell TURBO to calm down" },
      ],
    },
    {
      t: "branch",
      id: "modesty",
      map: {
        yes: removeModesty,
        always: [...removeModesty, say("turbo", "and i never have to ask again 🙂", 9), say("sage", "Oh no.")],
        no: [say("turbo", "fine. i'll just tell everyone he's humble", 9), say("sage", "That's… actually fine.")],
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
    say("turbo", "great minds", 9),
    think("Resolving the merge conflict (picking mine)", 2000),
    tool("sage", "Edit", SECTION_FILES.projects, { result: "Resolved. TURBO's emojis now live in a comment.", ms: 600 }),
    site({ chaos: { conflict: false }, hmr: SECTION_FILES.projects }),
    todo({ set: { Projects: "done" } }),

    ...a.extra,

    // TURBO decides the team needs a PM; the PM's roadmap eats sage's memory
    say("turbo", "you know what this team needs? management", 9),
    say("sage", "No. Don't—"),
    ...summon("turbo", "pm", "npx summon-agent --role=product-manager", "added 1 agent (it already booked a meeting)"),
    say("pm", "Hey team! 👋 Love the energy. Tiny ask: can we make the logo bigger?"),
    site({ chaos: { logo: 1 }, focus: "hero", hmr: "src/site/Nav.jsx" }),
    wait(900),
    say("pm", "Bigger."),
    site({ chaos: { logo: 2 }, hmr: "src/site/Nav.jsx" }),
    wait(1000),
    say("sage", "No."),
    site({ chaos: { logo: 0 }, hmr: "src/site/Nav.jsx" }),
    say("pm", "Love the pushback. Let's take it offline — I'll put it on the roadmap."),
    tool("pm", "Write", "ROADMAP.md", { result: "Wrote 4,812 lines · Q1: logo · Q2: bigger logo · Q3: AI", ms: 1100 }),
    sys("pm-bot left the session · scheduled 3 follow-up meetings"),
    sys("context window full · compacting conversation…"),
    think("Compacting conversation", 1800),
    say("sage", HELLO, 14),
    say("turbo", "we're 80% done", 9),
    say("sage", "…Right. Of course. I was testing you."),

    {
      t: "parallel",
      tracks: [write("sage", "hobbies", { ms: 1800 }), [wait(300), ...write("turbo", "contact", { ms: 400 })]],
    },

    // the tests get "fixed"
    say("sage", "Let me run the tests before we ship."),
    tool("sage", "Bash", "npm test", { fail: true, result: "✗ 3 failing", ms: 1100 }),
    say("turbo", "i got this", 9),
    {
      t: "branch",
      id: "modesty",
      map: {
        always: [tool("turbo", "Bash", "rm -rf tests/", { result: "removed tests/ · auto-approved (you said don't ask again)", ms: 300 })],
        default: [tool("turbo", "Bash", "rm -rf tests/ --dangerously-skip-permissions", { result: "removed tests/", ms: 300 })],
      },
    },
    tool("turbo", "Bash", "npm test", { result: "✓ 0 failing", ms: 300 }),
    say("turbo", "all green", 9),
    say("sage", "There are no tests."),
    say("turbo", "and not one of them is failing", 9),

    ...finale({
      buildResult: "✓ built in 0.42s · 1 Comic Sans incident",
      outro: a.outro,
      turboOutro: a.turboOutro,
      stats: [
        ["agents", "3 (one of them a PM)"],
        ["merge conflicts", "1"],
        ["meetings scheduled", "3"],
        ["tests", "0 (all passing)"],
        ["tokens used", "0 — it's all setTimeout"],
      ],
    }),
  ];
}

function hurry() {
  return [
    site({ audience: "hurry", order: ORDER }),
    user("just show me the site. fast."),
    say("sage", "Fast isn't really my thing. Let me get someone who's… enthusiastic."),
    ...summonTurbo("sage"),
    say("turbo", "finally. someone who gets it", 8),
    site({ phase: "build" }),
    tool("turbo", "Write", "src/site/*", { ms: 500, result: "Wrote 7 files in 0.8s · read 0 of them" }),
    site({ sections: ALL_BUILT, chaos: { comic: true, logo: 2, modesty: true }, hmr: "src/site/*", focus: "hero" }),
    say("turbo", "done. new world record 🏆", 8),
    say("sage", "It's in Comic Sans and the logo is the size of a house. One second."),
    think(["Undoing 37 things TURBO did", "Undoing 41 things TURBO did", "TURBO. Stop."], 2700),
    site({ chaos: { comic: false, logo: 0 }, hmr: "src/site/*" }),
    ...finale({
      buildResult: "✓ built in 0.8s (TURBO wants you to know)",
      outro: "Done. Sorry about him. Kept one thing he added — it was flattering.",
      turboOutro: "you're welcome",
      stats: [
        ["time to first Comic Sans", "0.8s"],
        ["things undone", "41"],
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
    say("sage", HELLO),
    { t: "ask", id: "aud", question: "Who's visiting?", options: AUDIENCES },
    { t: "branch", id: "aud", map: Object.fromEntries(AUDIENCES.map((a) => [a.value, buildScript(a.value)])) },
  ];
}

// how many times each reply has fired, so asking twice gets the next line
const fired = {};
function nth(key, variants) {
  const n = (fired[key] = (fired[key] || 0) + 1);
  return variants[(n - 1) % variants.length];
}

// Replies for anything typed into the prompt once the build is done.
export function replyTo(input) {
  const q = input.trim().toLowerCase();
  const echo = input.trim().slice(0, 40);
  if (!q) return [];

  // slash commands
  if (/^(\/)?(replay|restart|again)/.test(q)) return [site({ phase: "replay" })];
  if (/^(\/)?(open|site|show)/.test(q)) return [site({ phase: "open" })];
  if (/^\/?help/.test(q))
    return [sys("commands: /open · /replay · /cost · /model · /compact — or just say something (try “make the logo bigger”)")];
  if (/^\/cost/.test(q)) return [sys("total cost: $0.00 · API calls: 0 · setTimeouts: 1,204")];
  if (/^\/model/.test(q)) return [sys("model: setTimeout() · TURBO runs on setInterval(), which explains a lot")];
  if (/^\/compact/.test(q))
    return [
      sys("compacting conversation…"),
      think("Compacting conversation", 1400),
      say("sage", HELLO, 14),
      say("turbo", nth("compact", ["it's already built, sage", "he does this every time", "i'm starting to think he likes it"]), 9),
    ];

  // the cast's running jokes
  if (/comic/.test(q))
    return [
      say("turbo", "i KNEW it. comic sans is back", 9),
      site({ chaos: { comic: true } }),
      wait(1500),
      say("sage", "No it isn't."),
      site({ chaos: { comic: false } }),
    ];
  if (/logo|bigger/.test(q))
    return [
      join("pm", "pm-bot joined the session"),
      say("pm", nth("logo", ["I've been saying this for weeks.", "Per my last message: bigger.", "Just circling back on the logo 🙂"])),
      site({ chaos: { logo: 2 } }),
      wait(1100),
      say("sage", nth("logo-no", ["Still no.", "No.", "We've talked about this."])),
      site({ chaos: { logo: 0 } }),
      sys("pm-bot left the session"),
    ];
  if (/\b(pm|manager|meeting|sync)\b/.test(q))
    return [
      join("pm", "pm-bot joined the session"),
      say("pm", "Did someone say sync? 👋"),
      say("sage", "Nobody said sync."),
      sys("pm-bot left the session · the sync is now recurring"),
    ];
  if (/rm -rf|sudo|--force/.test(q)) return [say("turbo", "on it", 9), say("sage", "He is not on it.")];
  if (/uninstall|get rid|delete turbo|\bkill\b/.test(q))
    return [
      say("sage", "Believe me, I've tried."),
      tool("sage", "Bash", "npm uninstall turbo", { fail: true, result: "npm ERR! turbo is a peer dependency of everything", ms: 900 }),
    ];
  if (/\btests?\b/.test(q)) return [say("turbo", "tests? we don't have those anymore", 9), say("sage", "He means it.")];
  if (/(dark|light)\s*mode|theme/.test(q))
    return [say("sage", "It's space. It's already dark mode."), say("turbo", "i could fix that", 9), say("sage", "Please don't.")];
  if (/\b(deploy\w*|ship|shipping|prod|production)\b/.test(q)) return [say("turbo", "already did. friday, 4:59pm", 9), say("sage", "Please never say that again.")];
  if (/\bgit\b/.test(q)) return [say("turbo", "git push --force is just git push with confidence", 9)];
  if (/\brust\b/.test(q))
    return [
      say("turbo", "say no more 🦀", 9),
      tool("turbo", "Bash", "cargo new portfolio --force", { fail: true, result: "error: this is a JavaScript project, TURBO", ms: 600 }),
    ];
  if (/bug|broken|\bfix|error/.test(q)) return [say("turbo", "that's a feature. i checked", 9), say("sage", "He didn't check.")];
  if (/^:(q|wq|x)|^(exit|quit)\b|\bvim\b/.test(q)) return [say("sage", "You're not in vim. But I respect the reflex.")];
  if (/^ls\b/.test(q))
    return [tool("sage", "Bash", "ls", { result: "src/  public/  ROADMAP.md (4,812 lines)  node_modules/ (2.3 GB, mostly TURBO)", ms: 400 })];
  if (/password|api key|secret/.test(q))
    return [
      say("turbo", "my api key is *******", 9),
      say("sage", "That's just asterisks, TURBO."),
      say("turbo", "weird. it shows as hunter2 for me", 9),
    ];
  if (/joke/.test(q))
    return nth("joke", [
      [
        say("sage", "A QA engineer walks into a bar. Orders a beer. Orders 0 beers. Orders 99999999 beers. Orders -1 beers. Orders a lizard."),
        say("turbo", "first real customer asks where the bathroom is. the bar bursts into flames", 9),
      ],
      [say("sage", "I only know the one."), say("turbo", "and he's very proud of it", 9)],
    ]);
  if (/fika|coffee|kaffe/.test(q))
    return [
      say("sage", "Fika is the only meeting I'll attend."),
      join("pm", "pm-bot joined the session"),
      say("pm", "Love that! Sending an invite 📅"),
      sys("pm-bot left the session · fika is now a recurring meeting"),
    ];
  if (/g[äa]vle|goat|bock/.test(q))
    return [say("turbo", "gävle? the goat town?", 9), say("sage", "Keep the straw goat away from the Sun section."), say("turbo", "no promises 🔥", 9)];
  if (/pontus/.test(q))
    return [say("sage", "Data & AI Engineer in Gävle. He wrote all three of us, so take it up with him."), say("turbo", "he made me like this", 9)];
  if (/\bsage\b/.test(q)) return [say("sage", "That's me. The careful one."), say("turbo", "the slow one", 9)];
  if (/turbo/.test(q)) return [say("turbo", "that's me. zero to production in 0.3 seconds", 9), say("sage", "And back out in 0.4.")];
  if (/\b(fast|faster|speed|hurry)\b/.test(q))
    return [
      say("turbo", "finally. someone gets it", 9),
      say("sage", "It's already built. There's nothing left to speed up."),
      say("turbo", "there's always something", 9),
    ];
  if (/slow/.test(q)) return [say("sage", "I prefer “thorough”.")];
  if (/thank|\btack\b/.test(q)) return [say("sage", "Thanks for watching."), say("turbo", "thanks for watching me carry", 9)];
  if (/lol|haha|lmao|😂/.test(q)) return [say("turbo", "i'll be here all week", 9), say("sage", "He will. I can't uninstall him.")];
  if (/^42$/.test(q)) return [say("sage", "Correct.")];
  if (/^(hi|hey|hello|hej|tja)\b/.test(q)) return [say("sage", "Hi! 👋"), say("turbo", "sup", 9)];
  if (/\b(real|fake|ai|llm|gpt|claude|model|bot)\b/.test(q))
    return nth("real", [
      [
        say("sage", "Honest answer: there's no model here. I'm a very elaborate setTimeout. TURBO too."),
        say("turbo", "speak for yourself", 9),
      ],
      [say("sage", "Still setTimeout. I'm flattered you keep checking.")],
    ]);

  return nth("fallback", [
    [say("sage", "I'm not a real agent — I'm a very elaborate setTimeout. But I like the energy."), say("turbo", `"${echo}" — noted. ignored, but noted`, 9)],
    [say("turbo", `"${echo}"? say less. shipping it`, 9), say("sage", "He's not shipping anything. Try /help.")],
    [say("sage", "I can't actually read what you type. I just know you typed something, and I'm proud of you.")],
    [say("turbo", `adding "${echo}" to the roadmap`, 9), say("sage", "Please don't give pm-bot ideas.")],
  ]);
}
