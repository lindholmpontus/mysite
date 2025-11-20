import { useNavigate } from "react-router-dom";
import csLogo from "../assets/cs2.jpg";
import faceitIcon from "../assets/faceit_logo.png";
import steamIcon from "../assets/steam_logo.png";
import hltvIcon from "../assets/hltv_logo.png";

export default function Cs2Stats() {
  const navigate = useNavigate();

  const csData = {
    nickname: "ELMO",
    peakElo: 3100,
    hours: 7500,
    links: {
      faceit: "https://www.faceit.com/en/players/ELMO",
      hltv: "https://www.hltv.org/player/14252/elmo",
      steam: "https://steamcommunity.com/id/itsyaboyELMO/",
    },
  };

  const linkBtn = "flex items-center gap-2 px-4 py-2 border rounded-md bg-black/30 hover:bg-black/60 transition";

  return (
    <div className="min-h-screen w-full bg-[#0b0b14] text-gray-200 flex flex-col items-center p-6">

      <button
        onClick={() => navigate("/")}
        className="self-start px-4 py-1 mb-6 rounded-md bg-white/5 hover:bg-white/10 text-gray-300 transition"
      >
        ← Back
      </button>

      <div className="p-8 rounded-2xl bg-white/5 backdrop-blur-md shadow-[0_0_30px_rgba(0,0,0,0.4)] max-w-lg w-full text-center">

        {csLogo && (
          <img src={csLogo} alt="CS2" className="rounded-xl w-44 mx-auto mb-6 shadow-lg" />
        )}

        <h2 className="text-3xl font-bold text-white mb-3">{csData.nickname}</h2>

        <p className="text-lg font-semibold text-yellow-300 mb-1">Peak elo: {csData.peakElo}</p>
        <p className="text-lg font-semibold text-yellow-300 mb-4">
          Total hours: {csData.hours.toLocaleString()}
        </p>

        <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-yellow-600 to-transparent opacity-60 mb-4" />
      </div>

      <div className="mt-10 flex flex-wrap gap-4 justify-center">
        <a href={csData.links.faceit} target="_blank"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 backdrop-blur-md transition">
          <img src={faceitIcon} alt="Faceit" className="w-6" /> FACEIT
        </a>

        <a href={csData.links.hltv} target="_blank"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 backdrop-blur-md transition">
          <img src={hltvIcon} alt="HLTV" className="w-6" /> HLTV
        </a>

        <a href={csData.links.steam} target="_blank"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 backdrop-blur-md transition">
          <img src={steamIcon} alt="Steam" className="w-6" /> STEAM
        </a>
      </div>
    </div>

  );
}
