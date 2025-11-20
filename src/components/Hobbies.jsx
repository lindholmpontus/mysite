import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import backgroundImg from "../assets/blackgreen.jpeg";
import gamingImg from "../assets/gaming.jpg";
import guitarImg from "../assets/guitar.png";
import gymImg from "../assets/gym.jpg";

export default function Hobbies() {
    const navigate = useNavigate();

    const [terminalLines, setTerminalLines] = useState([]);
    const [reveals, setReveals] = useState([]);

    const introCommands = [
        "Connecting to Pontus mainframe...",
        "Decrypting identity modules...",
        "Breaching hobby firewall...",
        "Decoding encrypted interests...",
        "",
        ">> HOBBY LOG FOUND"
    ];

    const hobbySequence = [
        { text: 'Intressen inkluderar: "Spela gitarr"', img: guitarImg },
        { text: 'Intressen inkluderar: "Gamea"', img: gamingImg },
        { text: 'Intressen inkluderar: "Gymma"', img: gymImg }
    ];

    // INTRO TERMINAL SEQUENCE
    useEffect(() => {
        let i = 0;
        const introInterval = setInterval(() => {
            if (i < introCommands.length) {
                setTerminalLines(prev => [...prev, introCommands[i]]);
                i++;
            } else {
                clearInterval(introInterval);
                startHobbyReveal();
            }
        }, 900);

        return () => clearInterval(introInterval);
    }, []);

    // HOBBY REVEAL SEQUENCE
    function startHobbyReveal() {
        let index = 0;

        const revealInterval = setInterval(() => {
            const item = hobbySequence[index];
            setTerminalLines(prev => [...prev, "", ">> " + item.text]);
            setReveals(prev => [...prev, item.img]);
            index++;

            if (index >= hobbySequence.length) clearInterval(revealInterval);
        }, 1600);
    }

    return (
        <div className="min-h-screen w-full bg-black text-green-400 font-mono flex flex-col items-center pt-20 px-4 relative">
                  <img
                    src={backgroundImg}
                    alt="background"
                    className="absolute inset-0 w-full h-full object-cover blur-xl opacity-10"
                  />

            {/* EXIT BUTTON */}
            <button
                onClick={() => navigate(-1)}
                className="absolute top-4 left-4 z-50 border border-green-500 text-green-300 px-4 py-1 rounded hover:bg-green-500 hover:text-black transition"
            >
                {">"} Exit
            </button>

            {/* TERMINAL BOX */}
            <div className="bg-[#0c0c0c] border border-green-700 rounded-lg p-6 w-full max-w-2xl shadow-[0_0_25px_#00ff95] text-left">
                {terminalLines.map((line, i) => (
                    <div key={i} className="typing-line">{line}</div>
                ))}
                <span className="animate-pulse">█</span>
            </div>

            {/* IMAGE REVEAL */}
            <div className="mt-10 flex flex-row flex-wrap gap-6 justify-center">
                {reveals.map((img, i) => (
                    <img
                        key={i}
                        src={img}
                        alt="hobby"
                        className="w-72 rounded-lg border border-green-700 shadow-[0_0_15px_#00ff95] opacity-0 animate-fadeIn"
                    />
                ))}
            </div>


            {/* CSS ANIMATIONS */}
            <style>{`
        .typing-line {
          animation: typeIn 0.25s ease;
        }
        @keyframes typeIn {
          from { opacity: 0; transform: translateX(-5px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease forwards;
        }
      `}</style>
        </div>
    );
}
