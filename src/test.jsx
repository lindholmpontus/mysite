import React, { useState, useEffect } from "react";
import pontImg from "./assets/pont.png";
import backgroundImg from "./assets/blackgreen.jpeg";

// Import icons
import reactLogo from "./assets/react.png";
import javaLogo from "./assets/java.png";
import csharpLogo from "./assets/csharp.png";
import pythonLogo from "./assets/python.png";
import tailwindLogo from "./assets/tailwind.png";
import arcgisLogo from "./assets/arcgis.png";
import sqlLogo from "./assets/sql.png";
import javascriptLogo from "./assets/javascript.png";
import phpLogo from "./assets/php.svg";
import linkedinLogo from "./assets/linkedin.svg";
import githubLogo from "./assets/github.png";

export default function Portfolio() {
  const [activeView, setActiveView] = useState("home");
  const [progress, setProgress] = useState(0);
  const [shownLines, setShownLines] = useState([]);
  const [animationDone, setAnimationDone] = useState(false);
  const [terminalInput, setTerminalInput] = useState("");
  const [showVideo, setShowVideo] = useState(false);
  const [abortMsg, setAbortMsg] = useState("");

  // NEW typing engine states
  const [typedLines, setTypedLines] = useState([]);
  const [currentLine, setCurrentLine] = useState("");
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [heroDone, setHeroDone] = useState(false);

  const aboutLines = [
    "NAME: PONTUS_LINDHOLM",
    "AGE: 26",
    "CURRENT_LOCATION: GÄVLE_SWEDEN",
    "",
    "DO YOU WANT TO LOAD TARGET_PRESENTATION? (y/n?)"
  ];

  // Reset typing when entering About
  useEffect(() => {
    if (activeView !== "about") return;
    setTypedLines([]);
    setCurrentLine("");
    setLineIndex(0);
    setCharIndex(0);
  }, [activeView]);

  // Typing effect
  useEffect(() => {
    if (activeView !== "about") return;
    if (lineIndex >= aboutLines.length) return;

    const fullLine = aboutLines[lineIndex];

    // Instant blank line
    if (fullLine === "" && charIndex === 0) {
      setTypedLines(prev => [...prev, ""]);
      setLineIndex(prev => prev + 1);
      return;
    }

    const interval = setInterval(() => {
      if (charIndex < fullLine.length) {
        setCurrentLine(prev => prev + fullLine[charIndex]);
        setCharIndex(prev => prev + 1);
      } else {
        setTypedLines(prev => [...prev, currentLine]);
        setCurrentLine("");
        setCharIndex(0);
        setLineIndex(prev => prev + 1);
      }
    }, 35);

    return () => clearInterval(interval);
  }, [charIndex, lineIndex, activeView, currentLine]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background */}
      <img
        src={backgroundImg}
        alt="background"
        className="absolute inset-0 w-full h-full object-cover blur-xl opacity-50"
      />

      <div className="absolute inset-0 bg-black/85"></div>

      {/* Content */}
      <div className="relative z-10 text-white px-6 flex flex-col items-center text-center">
        {/* Hero */}
        <div className="pt-20 pb-10">
          <h1
            className={`text-green-400 text-4xl md:text-6xl font-mono typing-effect ${
              heroDone ? "no-cursor" : ""
            }`}
            onAnimationEnd={() => setHeroDone(true)}
          >
            Hej! Jag heter Pontus Lindholm {!heroDone && <span className="cursor">|</span>}
          </h1>
        </div>

        {/* Card */}
        <div className="mt-10 w-full max-w-2xl bg-[#111111]/80 backdrop-blur-sm p-8 rounded-xl shadow-lg border border-green-900/20 space-y-6 transition-all duration-300">
          {/* HOME */}
          {activeView === "home" && (
            <>
              <p>
                Med en kandidatexamen i Datavetenskap är jag ivrig att ta nästa steg ut i
                arbetslivet. Jag brinner för utveckling, problemlösning och att skapa
                smarta, snygga och effektiva digitala lösningar.
              </p>
              <p>
                <strong
                  onClick={() => setActiveView("about")}
                  className="text-green-300 cursor-pointer hover:text-green-500"
                >
                  {">"} Om mig
                </strong>
                <br />
                <strong
                  onClick={() => setActiveView("projects")}
                  className="text-green-300 cursor-pointer hover:text-green-500"
                >
                  {">"} Mina projekt
                </strong>
                <br />
                <strong
                  onClick={() => setActiveView("skills")}
                  className="text-green-300 cursor-pointer hover:text-green-500"
                >
                  {">"} Skills
                </strong>
                <br />
                <strong
                  onClick={() => setActiveView("contact")}
                  className="text-green-300 cursor-pointer hover:text-green-500"
                >
                  {">"} Kontakt
                </strong>
                <br />

                <a
                  href="/cv.pdf"
                  download="Pontus_Lindholm_CV.pdf"
                  className="group block w-full border border-green-500 rounded-lg p-3 mt-4 font-mono text-green-300 text-center hover:bg-green-500 hover:text-black transition duration-200 shadow-lg hover:shadow-green-500/50"
                >
                  <div className="flex items-center justify-center gap-2">
                    <span className="group-hover:font-bold">{">"} Ladda ner mitt CV</span>
                  </div>
                </a>
              </p>
            </>
          )}

          {/* ABOUT */}
          {activeView === "about" && (
            <div className="font-mono text-green-400 animate-fade-in">
              {typedLines.map((line, i) => (
                <div key={i} className="text-green-300">
                  {line}
                </div>
              ))}

              {lineIndex < aboutLines.length && (
                <div className="text-green-300">
                  {currentLine}
                  <span className="animate-pulse">_</span>
                </div>
              )}

              {lineIndex >= aboutLines.length && !showVideo && !abortMsg && (
                <div className="mt-4">
                  <span>&gt; </span>
                  <input
                    type="text"
                    value={terminalInput}
                    onChange={(e) => setTerminalInput(e.target.value.toLowerCase())}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        terminalInput === "y"
                          ? setShowVideo(true)
                          : setAbortMsg("ABORTING LAUNCH SEQUENCE...");
                      }
                    }}
                    className="bg-transparent border-none outline-none text-green-300 w-32 caret-green-400"
                    autoFocus
                  />
                </div>
              )}

              {abortMsg && (
                <p className="text-red-400 mt-3 tracking-widest">{abortMsg}</p>
              )}

              {showVideo && (
                <div className="mt-6 border border-green-700 rounded-md overflow-hidden">
                  <iframe
                    className="w-full h-64"
                    src="https://www.youtube.com/embed/_FrOQC-zEog?modestbranding=1&rel=0&controls=1"
                    title="YouTube Video"
                    allowFullScreen
                  ></iframe>
                </div>
              )}

              <button
                onClick={() => {
                  setActiveView("home");
                  setTerminalInput("");
                  setShowVideo(false);
                  setAbortMsg("");
                }}
                className="mt-6 px-4 py-2 border border-green-500 text-green-300 rounded-sm hover:bg-green-500 hover:text-black transition block mx-auto"
              >
                &gt; exit.about --return
              </button>
            </div>
          )}

          {/* PROJECTS */}
          {activeView === "projects" && (
            <>
              <h2 className="text-green-400 text-2xl font-mono typing-effect">
                {"$ projects"}
              </h2>
              <p className="text-green-200 font-mono text-sm">Coming soon...</p>
              <button
                onClick={() => setActiveView("home")}
                className="mt-6 px-4 py-2 border border-green-500 text-green-300 rounded hover:bg-green-500 hover:text-black transition font-mono"
              >
                {"<"} Tillbaka
              </button>
            </>
          )}

          {/* SKILLS */}
          {activeView === "skills" && (
            <>
              <h2 className="text-green-400 text-2xl font-mono typing-effect">
                {"$ skills"}
              </h2>
              <div className="grid grid-cols-3 gap-6 mt-4">
                {[
                  { logo: javaLogo, name: "Java" },
                  { logo: csharpLogo, name: "C#" },
                  { logo: pythonLogo, name: "Python" },
                  { logo: reactLogo, name: "React" },
                  { logo: tailwindLogo, name: "Tailwind" },
                  { logo: arcgisLogo, name: "ArcGIS" },
                  { logo: sqlLogo, name: "SQL" },
                  { logo: javascriptLogo, name: "JavaScript" },
                  { logo: phpLogo, name: "PHP" }
                ].map((skill) => (
                  <div key={skill.name} className="flex flex-col items-center">
                    <img src={skill.logo} className="w-12" alt={skill.name} />
                    <p className="text-sm mt-2">{skill.name}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setActiveView("home")}
                className="mt-6 px-4 py-2 border border-green-500 text-green-300 rounded hover:bg-green-500 hover:text-black transition font-mono"
              >
                {"<"} Tillbaka
              </button>
            </>
          )}

          {/* CONTACT */}
          {activeView === "contact" && (
            <>
              <h2 className="text-green-400 text-2xl font-mono typing-effect">
                {"$ contact"}
              </h2>

              <p className="text-green-200 font-mono text-sm mb-1">
                [MAIL] → lindholmpontus@outlook.com
              </p>

              <p className="text-green-200 font-mono text-sm mb-4">
                [TEL ] → 070-778 30 65
              </p>

              <div className="flex justify-center gap-10 mt-6">
                <a
                  href="https://www.linkedin.com/in/pontus-lindholm-170708368/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transform hover:scale-110 hover:brightness-125 transition"
                >
                  <img src={linkedinLogo} alt="LinkedIn" className="w-12 h-12" />
                </a>

                <a
                  href="https://github.com/lindholmpontus"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transform hover:scale-110 hover:brightness-125 transition"
                >
                  <img src={githubLogo} alt="GitHub" className="w-12 h-12 rounded" />
                </a>
              </div>

              <button
                onClick={() => setActiveView("home")}
                className="mt-7 px-4 py-2 border border-green-500 text-green-300 rounded hover:bg-green-500 hover:text-black transition font-mono"
              >
                {"<"} Tillbaka
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
