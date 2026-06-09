// projects.js — shared project data (English) used by the Projects panel + modal.
// No screenshots: the cards are clean text cards and the modal is content-first.

export const getTagColor = (tag) => {
  switch (tag.toLowerCase()) {
    case "java":
      return "bg-red-900/30 text-red-300 border-red-600";
    case "javascript":
    case "node.js":
      return "bg-yellow-900/30 text-yellow-300 border-yellow-500";
    case "react":
      return "bg-cyan-900/30 text-cyan-300 border-cyan-500";
    case "tailwind":
      return "bg-sky-900/30 text-sky-300 border-sky-500";
    case "kotlin":
      return "bg-purple-900/30 text-purple-300 border-purple-500";
    case "spring boot":
      return "bg-green-900/30 text-green-300 border-green-600";
    case "firebase":
      return "bg-orange-900/30 text-orange-300 border-orange-500";
    case "leaflet.js":
      return "bg-emerald-900/30 text-emerald-300 border-emerald-500";
    case "three.js":
      return "bg-indigo-900/30 text-indigo-300 border-indigo-500";
    case "android studio":
      return "bg-lime-900/30 text-lime-300 border-lime-500";
    case "graalvm":
      return "bg-amber-900/30 text-amber-300 border-amber-600";
    default:
      return "bg-gray-900/30 text-gray-300 border-gray-600";
  }
};

export const projects = [
  {
    title: "HittaGira.se",
    desc: "A website I designed and built. Collecting ads from multiple sources into one place to make it easier to find the perfect guitar.",
    details:
      "A website I created and deployed end to end — live at hittagira.se.",
    tags: ["React", "JavaScript"],
    link: "https://hittagira.se",
  },
    {
    title: "Thesis — Lantmäteriet",
    desc: "Analysis of performance and resource usage in Java applications (GraalVM vs JVM).",
    details:
      "Bachelor's thesis at Lantmäteriet (the Swedish mapping authority) where I analyzed performance, resource usage and scalability in Java applications by comparing GraalVM Native Image and the JVM.",
    tags: ["Java", "GraalVM", "Spring Boot"],
    link: "https://hig.diva-portal.org/smash/get/diva2:1973227/FULLTEXT01.pdf",
  },
  {
    title: "Maximalfönster — Sales App",
    desc: "An internal app for the company's sales reps that replaces manual window measuring.",
    details:
      "An internal app for the company's sales reps that streamlines manual window measuring. It lets them register measurements digitally on-site, ensures correct values, and shows a real-time visual installation sketch.",
    tags: ["React", "JavaScript", "TailWind"],
  },
  {
    title: "Dark Finder",
    desc: "A web app for finding spots with minimal light pollution for stargazing.",
    details:
      "Dark Finder is a web app that helps you find the nearest places with minimal light pollution for optimal stargazing. It analyzes satellite data and shows the best dark spots on an interactive map, using Leaflet.js for map visualization.",
    tags: ["Python", "JavaScript", "Leaflet.js"],
    github: "https://github.com/lindholmpontus/lightfinder",
  },
  {
    title: "SpaceParty",
    desc: "An online Android multiplayer game.",
    details:
      "A multiplayer game for Android inspired by Mario Party. It's a board game where different mini-games trigger when a player lands on a mini-game tile. Built with Kotlin and using Firebase for the realtime database.",
    tags: ["Kotlin", "FireBase", "Android Studio"],
    github: "https://github.com/JohnNorrbom/Klientutvecklingsprojekt",
  },
  {
    title: "Java Chess",
    desc: "A fully working chess game coded in Java.",
    details:
      "A classic chess game implemented in Java. Built with Java Swing — which is (very) outdated by now, but it works!",
    tags: ["Java"],
    github: "https://github.com/lindholmpontus/javachess",
  },
];
