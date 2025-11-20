import React, { useState } from "react";
import backgroundImg from "./assets/blackgreen.jpeg";
import About from "./components/About.jsx";
import Projects from "./components/Projects.jsx";
import Skills from "./components/Skills.jsx";
import Contact from "./components/Contact.jsx";
import { useNavigate } from "react-router-dom";

export default function Portfolio() {
  const [heroDone, setHeroDone] = useState(false);
  const [showGame, setShowGame] = useState(false);
  const navigate = useNavigate();
  const [offset, setOffset] = React.useState(0);

  return (

    <div className="relative min-h-screen w-full overflow-hidden">

      {/* BACKGROUND */}
      <img
        src={backgroundImg}
        alt="background"
        className="absolute inset-0 w-full h-full object-cover blur-xl opacity-50"
      />
      <div className="absolute inset-0 bg-black/85" />

      {/* CONTENT */}
      <div className="relative z-10 text-white px-6 flex flex-col items-center text-center">

        {/* HERO */}
        <header className="pt-20 pb-16">
          <h1
            className={`text-green-400 text-4xl md:text-6xl font-mono typing-effect overflow-hidden leading-[1.2] py-1 ${heroDone ? "no-cursor" : ""}`}
            onAnimationEnd={() => setHeroDone(true)}
          >
            Hej! Jag heter Pontus Lindholm
            {!heroDone && <span className="cursor">|</span>}
          </h1>
        </header>

        {/* INTRO */}
        <section className="w-full max-w-2xl bg-black/40 border border-green-500/20 backdrop-blur-sm rounded-xl p-8 mb-16 text-left shadow-lg shadow-green-500/10 hover:shadow-green-500/20 transition-all duration-300 hover:-translate-y-1">
          <h2 className="text-xl md:text-2xl font-mono text-green-400 tracking-wide mb-3 flex items-center gap-2">
            <span className="text-green-500">&#62;_</span> Vem är jag?
          </h2>

          <div className="h-[1px] w-full bg-gradient-to-r from-green-500/40 to-transparent mb-5"></div>

          <p className="text-gray-300 leading-relaxed font-light">
            Jag är en nyexaminerad systemutvecklare som gärna kombinerar mitt intresse för
            <span className="text-green-400"> teknik</span> och
            <span className="text-yellow-400"> människor</span>.
          </p>

          <p className="text-gray-300 leading-relaxed font-light mt-4">
            Jag gillar processen därkod inte bara fungerar, utan <span className="text-green-400">känns bra</span>.
          </p>

          <a
            href="/cv.pdf"
            download="Pontus_Lindholm_CV.pdf"
            className="inline-block border border-green-500 rounded-lg px-6 py-2 mt-6 font-mono text-green-300 transition duration-200 hover:bg-green-500 hover:text-black shadow-inner hover:shadow-green-500/30"
          >
            {">"} Ladda ner CV
          </a>
        </section>

        {/* COMPONENTS */}
        <About />
        <Projects />
        <Skills />
        <Contact />

        {/* === THE LAB === */}
        <section className="w-full max-w-2xl bg-[#0b0b0b]/70 border border-green-900/30 rounded-xl p-8 mb-32 mt-10 backdrop-blur-md shadow-lg shadow-green-900/20">
          <h2 className="text-green-400 text-2xl font-mono mb-4 flex items-center gap-2">
            <span className="text-green-500">&#62;_</span> the lab
          </h2>

          <p className="text-sm text-green-200/70 font-mono mb-5">
            Här släpper jag lös grejer som kanske (inte) behövs.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* GAME */}
            <div
              onClick={() => navigate("/gaming")}
              className="cursor-pointer border border-green-700 bg-black/40 rounded-lg p-4 font-mono text-green-300 hover:bg-green-600 hover:text-black transition hover:scale-[1.03] text-center"
            >
              {">"} Gaming Achivements
            </div>

            {/* HYPNOTIZE */}
            <div
              onClick={() => navigate("/hypnotize")}
              className="cursor-pointer border border-green-700 bg-black/40 rounded-lg p-4 font-mono text-green-300 hover:bg-green-600 hover:text-black transition hover:scale-[1.03] text-center"
            >
              {">"} Bli hypnotiserad
            </div>

            {/* UNEMPLOYED BUTTON (example) */}
            <div
              onClick={() => navigate("/unemployedment")}
              className="cursor-pointer border border-yellow-600/40 bg-black/30 rounded-lg p-4 font-mono text-yellow-300 hover:bg-yellow-400 hover:text-black transition hover:scale-[1.03] text-center"
            >
              {">"} Ladda arbetslöshet
            </div>

            {/* HOBBIES BUTTON (example) */}
            <div
              onClick={() => navigate("/hobbies")}
              className="cursor-pointer border border-blue-600/40 bg-black/30 rounded-lg p-4 font-mono text-green-300 hover:bg-yellow-400 hover:text-black transition hover:scale-[1.03] text-center"
            >
              {">"} Ta reda på mina intressen
            </div>

            <div
              onMouseEnter={() => {
                const random = Math.floor(Math.random() * 1600) - 80; // -80 till +80 px
                setOffset(random);
              }}
              style={{
                transform: `translateX(${offset}px)`,
                transition: "transform 0.15s ease"
              }}
              className="cursor-pointer border border-blue-600/40 bg-black/30 rounded-lg p-4 font-mono text-green-300 text-center"
            >
              {">"} Mina svagheter
            </div>

            {/* FUTURE FEATURE SLOT */}
            <div className="border border-gray-700 bg-black/20 rounded-lg p-4 font-mono text-gray-400 text-center opacity-50">
              {">"} More coming soon...
            </div>

          </div>
        </section>


      </div>
    </div>
  );
}
