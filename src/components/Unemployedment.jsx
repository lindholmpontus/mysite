import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import backgroundImg from "../assets/blackgreen.jpeg";

export default function Unemployment() {
  const [terminalLines, setTerminalLines] = useState([]);
  const [showProgress, setShowProgress] = useState(false);
  const [progress, setProgress] = useState(0);

  const navigate = useNavigate();

  const commands = [
    "Initializing system...",
    "Loading employment statistics...",
    "Connecting to Arbetsförmedlingen API...",
    "Fetching data...",
    "Analyzing results...",
    "Status: Critical",
    ">> Displaying ARBETSLÖSHET"
  ];

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < commands.length) {
        setTerminalLines((prev) => [...prev, commands[index]]);
        index++;
      } else {
        clearInterval(interval);
        setTimeout(() => setShowProgress(true), 700);
      }
    }, 900);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!showProgress || progress >= 100) return;

    const interval = setInterval(() => {
      setProgress((prev) => prev + 2);
    }, 70);

    return () => clearInterval(interval);
  }, [showProgress, progress]);

  return (
    <div className="h-screen w-full bg-black flex items-center justify-center px-6 relative">

      {/* BACKGROUND */}
      <img
        src={backgroundImg}
        alt="background"
        className="absolute inset-0 w-full h-full object-cover blur-xl opacity-10"
      />

      {/* EXIT BUTTON */}
      <button
        onClick={() => navigate(-1)}
        className="fixed top-4 left-4 z-50 border border-green-500 text-green-300 px-4 py-1 rounded font-mono hover:bg-green-500 hover:text-black transition"
      >
        {">"} Exit
      </button>

      {/* TERMINAL CONTAINER */}
      <div className="w-full max-w-2xl bg-[#0c0c0c] border border-green-700 rounded-lg p-6 font-mono text-green-400 shadow-[0_0_25px_#00ff95]">

        {/* TERMINAL TEXT */}
        <div className="mb-6 min-h-[180px]">
          {terminalLines.map((line, i) => (
            <div key={i} className="typing-line text-sm">{line}</div>
          ))}
          {!showProgress && <span className="animate-pulse">█</span>}
        </div>

        {/* PROGRESS BAR HOLDER */}
        <div className="min-h-[70px] flex flex-col justify-end">
          {showProgress && (
            <>
              <p className="text-green-300 text-sm mb-2">ARBETSLÖSHET: {progress}%</p>
              <div className="w-full h-4 bg-green-900/30 rounded-md overflow-hidden border border-green-600">
                <div
                  className="h-full bg-green-500 transition-all duration-100"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </>
          )}
        </div>

      </div>

      {/* ANIMATIONS */}
      <style>{`
        .typing-line {
          animation: typeIn 0.3s ease;
        }
        @keyframes typeIn {
          from { opacity: 0; transform: translateX(-5px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>

    </div>
  );
}
