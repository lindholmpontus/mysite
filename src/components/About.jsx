import React, { useState, useEffect } from "react";

export default function About() {
  const [aboutActive, setAboutActive] = useState(false);
  const [hoverTime, setHoverTime] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [timerStarted, setTimerStarted] = useState(false);

  const [typedLines, setTypedLines] = useState([]);
  const [currentLine, setCurrentLine] = useState("");
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);

  const [terminalInput, setTerminalInput] = useState("");
  const [showVideo, setShowVideo] = useState(false);
  const [abortMsg, setAbortMsg] = useState("");

  const aboutLines = [
    "NAME: PONTUS_LINDHOLM",
    "AGE: 26",
    "CURRENT_LOCATION: GÄVLE_SWEDEN",
    "",
    "DO YOU WANT TO LOAD TARGET_PRESENTATION? (y/n?)"
  ];

  /* -----------------------------
      HOVER TIMER (3 SECONDS)
  ------------------------------*/
  const startHover = () => {
    if (aboutActive) return;

    setTimerStarted(true);
    setHoverTime(0);
    setCountdown(3);

    const interval = setInterval(() => {
      setHoverTime(prev => {
        if (prev >= 3) {
          clearInterval(interval);
          setAboutActive(true);
          setTimerStarted(false);
        }
        return prev + 1;
      });

      setCountdown(prev => (prev > 1 ? prev - 1 : 1));
    }, 1000);

    startHover.interval = interval;
  };

  const stopHover = () => {
    setTimerStarted(false);
    setHoverTime(0);
    setCountdown(3);
    clearInterval(startHover.interval);
  };

  /* -----------------------------
      TYPEWRITER EFFECT
  ------------------------------*/
  useEffect(() => {
    if (!aboutActive) return;
    if (lineIndex >= aboutLines.length) return;

    const fullLine = aboutLines[lineIndex];

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
  }, [charIndex, lineIndex, currentLine, aboutActive]);


  return (
    <section
      id="about"
      className="relative w-full max-w-2xl bg-[#111]/80 border border-green-900/20 rounded-xl p-8 mb-24 
                 font-mono text-gray-200 cursor-pointer overflow-hidden group"
      onMouseEnter={startHover}
      onMouseLeave={stopHover}
    >
      {/* BEFORE ACTIVATION – SHOW COUNTDOWN */}
      {!aboutActive && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-20 
                        text-gray-200 text-lg font-bold tracking-widest transition-opacity">
          {!timerStarted && <div>HOVER ME FOR PERSONAL DETAILS</div>}

          {timerStarted && (
            <div className="flex flex-col items-center gap-2">
              <div className="text-2xl animate-pulse">Loading…</div>
              <div className="text-4xl font-bold">{countdown}</div>
            </div>
          )}
        </div>
      )}

      {/* ACTUAL CONTENT */}
      <div
        className={`transition duration-500 
          ${!aboutActive ? "blur-md opacity-40" : "blur-0 opacity-100"}`}
      >
        <h2 className="text-green-400 text-2xl font-mono mb-5">{"$ about"}</h2>

        {typedLines.map((line, i) => (
          <div key={i} className="text-gray-200">{line}</div>
        ))}

        {lineIndex < aboutLines.length && (
          <div className="text-gray-200">
            {currentLine}
            <span className="animate-pulse text-gray-400">_</span>
          </div>
        )}

        {lineIndex >= aboutLines.length && !showVideo && !abortMsg && (
          <div className="mt-3">
            <span>&gt; </span>
            <input
              type="text"
              value={terminalInput}
              onChange={(e) => setTerminalInput(e.target.value.toLowerCase())}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (terminalInput === "y") setShowVideo(true);
                  else setAbortMsg("ABORTING LAUNCH SEQUENCE...");
                }
              }}
              className="bg-transparent border-none outline-none w-32 
                         text-gray-100 caret-white"
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
      </div>
    </section>
  );
}
