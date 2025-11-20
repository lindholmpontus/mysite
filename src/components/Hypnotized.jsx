import React from "react";
import { useNavigate } from "react-router-dom";

export default function Hypnotized() {
    const navigate = useNavigate();

    return (
        <div className="h-screen w-screen flex items-center justify-center bg-black overflow-hidden relative">
            
            {/* Hypnotic Spiral – classic black & white */}
            <div className="absolute w-[200vmax] h-[200vmax] animate-spinSlow rounded-full 
                bg-[conic-gradient(#000,#fff,#000,#fff,#000)] opacity-40" />

            {/* Text */}
            <h1 className="text-white text-5xl md:text-7xl font-mono font-bold animate-pulseSlow text-center drop-shadow-[0_0_20px_white] relative z-10">
                Du vill anställa mig!
            </h1>

            {/* Animations */}
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

            {/* Exit-button */}
            <button
                onClick={() => navigate(-1)}
                className="absolute top-4 left-4 border border-white text-white px-4 py-1 rounded font-mono hover:bg-white hover:text-black transition"
            >
                {">"} Exit
            </button>
        </div>
    );
}
