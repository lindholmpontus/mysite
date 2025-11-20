import React from "react";

export default function Projects() {
  const getTagColor = (tag) => {
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
      case "websockets":
        return "bg-indigo-900/30 text-indigo-300 border-indigo-500";
      case "android studio":
        return "bg-lime-900/30 text-lime-300 border-lime-500";
      case "graalvm":
        return "bg-amber-900/30 text-amber-300 border-amber-600";
      default:
        return "bg-gray-900/30 text-gray-300 border-gray-600";
    }
  };

  const projects = [
        {
      title: "Projektarbete - Maximalfönster",
      desc: "En intern app för företagets säljare som ersätter manuell fönstermätning. Den låter dem registrera mått digitalt på plats, säkerställer korrekta värden och visar en visuell monteringsskiss i realtid.",
      tags: ["JavaScript", "php",],
    },
    {
      title: "Examensarbete - Lantmäteriet",
      desc: "Examensarbete på Lantmäteriet där jag analyserade prestanda, resursanvändning och skalbarhet.",
      tags: ["Java", "GraalVM", "Spring Boot"],
      link: "https://hig.diva-portal.org/smash/get/diva2:1973227/FULLTEXT01.pdf",
    },
        {
      title: "SpaceParty",
      desc: "Online Android multiplayer game.",
      tags: ["Skolprojekt", "Kotlin", "FireBase", "Android Studio"],
      link: "https://github.com/JohnNorrbom/Klientutvecklingsprojekt",
    },
    {
      title: "This game will get you drunk",
      desc: "Ett festspel utvecklat för vändor till krogen.",
      tags: ["React", "JavaScript", "TailWind", "FireBase"],
      link: "https://github.com/lindholmpontus",
    },


  ];

  return (
    <section className="w-full max-w-2xl bg-[#111]/80 border border-green-900/20 rounded-xl p-8 mb-16">
      <h2 className="text-green-400 text-2xl font-mono mb-5">{"$ projects"}</h2>

      <div className="space-y-5">
        {projects.map((p, i) => (
          <div
            key={i}
            className="border border-green-900/40 bg-black/40 rounded-lg p-5 text-left transition duration-300 hover:scale-[1.03] hover:shadow-lg hover:shadow-green-500/30"
          >
            <h3 className="text-green-400 font-mono text-xl mb-2">{p.title}</h3>
            <p className="text-green-200 text-sm mb-3 leading-5 font-mono opacity-90">
              {p.desc}
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              {p.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className={`text-xs font-mono px-2 py-0.5 rounded-full border transition duration-200 hover:scale-110 ${getTagColor(tag)}`}
                >
                  {tag}
                </span>
              ))}
            </div>

            <a
              href={p.link}
              target="_blank"
              className="inline-block border border-green-500 text-green-400 font-mono px-3 py-1 rounded hover:bg-green-500 hover:text-black transition text-xs"
            >
              {">"} View Project
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
