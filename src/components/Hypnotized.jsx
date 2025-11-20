import React, { useState } from "react";
import { useNavigate } from "react-router-dom";


export default function Hypnotized() {
  const navigate = useNavigate();
  const [consent, setConsent] = useState(false);

  if (!consent) {
    return (
      <div className="h-screen w-screen bg-black flex flex-col items-center justify-center text-center">
        <h1 className="text-white text-3xl md:text-4xl font-mono mb-6">
          ⚠ Varning
        </h1>
        <p className="text-gray-300 font-mono mb-8 max-w-lg px-4">
          Denna sida innehåller starka visuella effekter och roterande mönster.
          <br />
          Vill du fortsätta?
        </p>

        <div className="flex gap-6">
          <button
            onClick={() => setConsent(true)}
            className="border border-green-500 text-green-400 px-6 py-2 rounded font-mono hover:bg-green-500 hover:text-black transition"
          >
            Ja, visa
          </button>

          <button
            onClick={() => navigate(-1)}
            className="border border-red-500 text-red-400 px-6 py-2 rounded font-mono hover:bg-red-500 hover:text-black transition"
          >
            Nej, tillbaka
          </button>
        </div>
      </div>
    );
  }

  return (

    <div className="h-screen w-screen flex items-center justify-center bg-black overflow-hidden relative">

      {/* Hypnotic Spiral */}
      {/* Spiral Wrapper – centrerar spiralen perfekt */}
      <div
        className="absolute top-1/2 left-1/2"
        style={{
          transform: "translate(-50%, -50%)",
          width: "200vmax",
          height: "200vmax",
          overflow: "hidden",
        }}
      >
        {/* Spiral that rotates */}
        <div
          className="animate-spinSlow"
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            background: `
        repeating-radial-gradient(
          circle,
          #fff 0,
          #fff 8px,
          #000 8px,
          #000 16px
        )
      `,
          }}
        />
      </div>


      {/* Text */}
      <h1
        className="text-white text-5xl md:text-7xl font-mono font-bold 
             animate-pulseSlow text-center relative z-10"
        style={{
          textShadow: `
      -2px -2px 0 #000,
      2px -2px 0 #000,
      -2px 2px 0 #000,
      2px 2px 0 #000
    `
        }}
      >
        Du vill anställa mig!
      </h1>


      {/* Animations */}
      <style>{`
        .animate-spinSlow {
          animation: spinSlow 6s linear infinite;
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
