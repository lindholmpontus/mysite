import { useNavigate } from "react-router-dom";
import lolLogo from "../assets/lol/Lol_Logo.png";
import rankEmblem from "../assets/lol/Master_Emblem.png";
import opggLogo from "../assets/lol/opgg.png";

export default function LolStats() {
    const navigate = useNavigate();

    const lolData = {
        name: "monkey madness",
        rank: "MASTER — 204 LP",
        server: "EUW",
        role: "Jungle",
    };

    return (
        <div className="min-h-screen w-full bg-[#06070a] bg-[radial-gradient(ellipse_at_center,rgba(0,38,72,0.45),rgba(0,0,0,0.9))] text-gray-200 flex flex-col items-center p-8 font-['Cinzel',serif] relative overflow-hidden">

            {/* Floating particles */}
            <div className="absolute inset-0 pointer-events-none [background:url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.15]" />

            {/* Back button */}
            <button
                onClick={() => navigate("/")}
                className="self-start px-4 py-1 mb-6 rounded-md border border-[#2a3d63] text-[#9ec6ff]
                   bg-black/40 backdrop-blur-sm
                   hover:bg-black/70 hover:text-white hover:border-[#7fb0ff] transition"
            >
                ← Back
            </button>

            {/* Logo */}
            <img
                src={lolLogo}
                alt="League of Legends"
                className="w-72 mb-5 drop-shadow-[0_0_35px_rgba(22,75,126,0.7)] animate-pulse-slow select-none 
                   transition-transform duration-300 hover:scale-110"
                draggable="false"
            />

            <div className="w-80 h-px bg-gradient-to-r from-transparent via-[#b68d35] to-transparent mb-10" />

            {/* Rank Display */}
            <div className="relative bg-black/30 backdrop-blur-md p-10 rounded-xl border border-[#604a1f] 
                      shadow-[0_0_25px_rgba(255,207,104,0.25),inset_0_0_15px_rgba(0,0,0,0.6)]
                      max-w-xl w-full text-center hover:shadow-[0_0_40px_rgba(255,229,150,0.35)] transition">

                <h2 className="text-3xl font-bold text-[#f4d287] mb-1 drop-shadow-[0_0_6px_black] tracking-wide uppercase">
                    {lolData.name}
                </h2>

                <p className="text-sm text-blue-300 mb-4 opacity-80 tracking-wide">
                    {lolData.server} • {lolData.role}
                </p>

                <img
                    src={rankEmblem}
                    alt="Rank Emblem"
                    className="w-40 mx-auto drop-shadow-[0_0_14px_rgba(152,111,255,0.7)]
                     transition-transform duration-300 hover:scale-110"
                />

                <p className="text-2xl font-extrabold text-[#d8b26a] mt-4 tracking-wide drop-shadow-[0_0_5px_black] uppercase">
                    {lolData.rank}
                </p>
            </div>

            {/* OP.GG Button */}
            <a
                href="https://www.op.gg/summoners/euw/monkey%20madness-0000"
                target="_blank"
                className="flex items-center gap-3 px-6 py-3 mt-5 bg-black/40 rounded-md 
             hover:bg-[#0c1221]/90 text-[#c7dcff] hover:text-white 
             shadow-[0_0_10px_rgba(0,85,255,0.3)] transition font-medium tracking-wide"
            >
                <img src={opggLogo} alt="OP.GG" className="h-6 opacity-90" />
                View OP.GG Profile
            </a>


            {/* Glow animation */}
            <style>
                {`
          @keyframes pulseGlow {
            0% { filter: drop-shadow(0 0 8px rgba(80,150,255,0.2)); }
            50% { filter: drop-shadow(0 0 18px rgba(80,150,255,0.55)); }
            100% { filter: drop-shadow(0 0 8px rgba(80,150,255,0.2)); }
          }
          .animate-pulse-slow {
            animation: pulseGlow 4s ease-in-out infinite;
          }
        `}
            </style>
        </div>
    );
}
