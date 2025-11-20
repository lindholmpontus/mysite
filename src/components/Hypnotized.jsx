import React from "react";
import { useNavigate } from "react-router-dom";

export default function Hypnotized() {
    const navigate = useNavigate();
    return (
        <div className="h-screen w-screen flex items-center justify-center bg-black overflow-hidden relative">
            {/* Hypnotic Spiral */}
            <div className="absolute w-[200vmax] h-[200vmax] animate-spinSlow rounded-full bg-[conic-gradient(#000000,#00ff9d,#000000,#00ff9d,#000000)] opacity-30" />

            {/* Text */}
            <h1 className="text-green-400 text-5xl md:text-7xl font-mono font-bold animate-pulseSlow text-center drop-shadow-[0_0_20px_#00ff9d] relative z-10">
                Du vill anställa mig!
            </h1>

            {/* Extra wobble effect */}
            <style>{`
        .animate-spinSlow {
          animation: spinSlow 8s linear infinite;
        }
        @keyframes spinSlow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .animate-pulseSlow {
          animation: pulseSlow 1.8s ease-in-out infinite;
        }

        @keyframes pulseSlow {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.15); opacity: 1; }
        }
      `}</style>


            <button
                onClick={() => navigate("/")}
                className="absolute top-4 left-4 border border-green-500 text-green-300 px-4 py-1 rounded font-mono hover:bg-green-500 hover:text-black transition"
            >
                {">"} Exit
            </button>
        </div>
    );
}
