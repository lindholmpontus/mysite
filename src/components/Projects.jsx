import React, { useState } from "react";
import ProjectModal from "./ProjectModal";
import windowsImg from "../assets/windows.jpg";
import starsImg from "../assets/stars.jpeg";
import gamingImg from "../assets/gaming.jpg";
import higImg from "../assets/projects/hig.png";
import SpacePartyImg from "../assets/projects/SpaceParty.png";
import chessImg from "../assets/projects/chess.png";
import darkFinderImg from "../assets/projects/darkfinder.png";
import solsimVideo from "../assets/projects/solsim.mp4";
import solsimImg from "../assets/projects/solsim.png";
import maximalImg from "../assets/projects/maximal.png";

export default function Projects() {
  const [selectedProject, setSelectedProject] = useState(null);

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
      desc: "En intern app för företagets säljare som ersätter manuell fönstermätning.",
      details: "En intern app för företagets säljare som effektiviserar processen vid manuell fönstermätning. Den låter dem registrera mått digitalt på plats, säkerställer korrekta värden och visar en visuell monteringsskiss i realtid.",
      tags: ["React", "JavaScript", "TailWind"],
      image: maximalImg,
    },
    {
      title: "Solar System Simulator (Inte helt färdig)",
      desc: "Solsystemssimulator med gravitationsmodeller i Java/Spring och 3D-visualisering i React och Three.js.",
      details: "En solsystemssimulator där planeternas rörelser beräknas med gravitationsmodeller i en Java/Spring-backend och visualiseras i 3D med React och Three.js. Texturen för planeterna är genererade med hjälp av Gemini 3.",
      tags: ["Spring Boot", "Java", "React", "Three.js"],
      github: "https://github.com/lindholmpontus/solsim",
      image: solsimImg,
      video: solsimVideo,
    },
    {
      title: "Examensarbete - Lantmäteriet",
      desc: "Analys av prestanda och resursanvändning i Java-applikationer (GraalVM vs JVM).",
      details: "Examensarbete på Lantmäteriet där jag analyserade prestanda, resursanvändning och skalbarhet i Java-applikationer genom att jämföra GraalVM Native Image och JVM.",
      tags: ["Java", "GraalVM", "Spring Boot"],
      link: "https://hig.diva-portal.org/smash/get/diva2:1973227/FULLTEXT01.pdf", // Paper link
      image: higImg,
    },

    {
      title: "Dark Finder",
      desc: "Webbapp för att hitta platser med minimal ljusförorening för stjärnskådning.",
      details: "Dark Finder är en webapp som hjälper dig att hitta de närmaste platserna med minimal ljusförorening för optimal stjärnskådning. Appen analyserar satellitdata och visar de bästa mörka platserna på en interaktiv karta. Använder Leaflet.js för kartvisualisering.",
      tags: ["Python", "JavaScript", "Leaflet.js"],
      github: "https://github.com/lindholmpontus/lightfinder",
      image: darkFinderImg,
    },
    {
      title: "SpaceParty",
      desc: "Online Android multiplayer spel.",
      details: "Ett multiplayer-spel för Android med inspiration från Mario Party. Spelet är ett brädspel där olika minigames kan triggas när en spelare går på en minigame-ruta. Byggt med Kotlin och använder Firebase för realtidsdatabas.",
      tags: ["Kotlin", "FireBase", "Android Studio"],
      github: "https://github.com/JohnNorrbom/Klientutvecklingsprojekt",
      image: SpacePartyImg,
    },
    {
      title: "Java Chess",
      desc: "Ett fullt fungerande Schack-spel kodat i Java.",
      details: "Ett klassiskt schackspel implementerat i Java. Tyvärr gjort i Java Swing som är (väldigt) outdated just nu.",
      tags: ["Java"],
      github: "https://github.com/lindholmpontus/javachess",
      image: chessImg,
    },
  ];

  return (
    <>
      <section className="w-full max-w-2xl bg-[#111]/80 border border-green-900/20 rounded-xl p-8 mb-16">
        <h2 className="text-green-400 text-2xl font-mono mb-5">{"projects"}</h2>

        <div className="space-y-5">
          {projects.map((p, i) => (
            <div
              key={i}
              className="border border-white/10 bg-black/40 rounded-lg p-5 text-left 
                   transition duration-300 hover:scale-[1.03] hover:shadow-xl hover:shadow-white/10 flex flex-col sm:flex-row gap-4 items-start sm:items-center"
            >
              {/* Optional Thumbnail in List View */}
              <div className="w-full sm:w-24 h-24 flex-shrink-0 bg-black/50 rounded-md overflow-hidden border border-white/5 hidden sm:block">
                {p.image ? (
                  <img src={p.image} alt={p.title} className="w-full h-full object-cover opacity-80" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-700 text-xs">No Img</div>
                )}
              </div>

              <div className="flex-grow">
                {/* TITLE */}
                <h3 className="text-white font-mono text-xl mb-2">{p.title}</h3>

                {/* DESC */}
                <p className="text-gray-300 text-sm mb-3 leading-5 font-mono opacity-90 line-clamp-2">
                  {p.desc}
                </p>

                {/* TAGS */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {p.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className={`text-xs font-mono px-2 py-0.5 rounded-full border transition duration-200 hover:scale-110 ${getTagColor(
                        tag
                      )}`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* BUTTON */}
                <button
                  onClick={() => setSelectedProject(p)}
                  className="inline-block border border-blue-400 text-blue-300 font-mono px-3 py-1 rounded 
                       hover:bg-blue-400 hover:text-black transition text-xs cursor-pointer"
                >
                  {">"} View Project
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Modal Integration */}
      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </>
  );
}
