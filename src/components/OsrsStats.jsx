import { useNavigate } from "react-router-dom";
import osrsLogo from "../assets/osrs/Old_School_Runescape_Logo.png";

export default function OsrsStats() {
  const navigate = useNavigate();

  const playerData = {
    "goblin cigar": {
      type: "Main",
      color: "text-green-300",
      skills: {
        Attack: 99, Defence: 99, Strength: 99, Hitpoints: 99, Ranged: 99,
        Prayer: 99, Magic: 99, Cooking: 99, Woodcutting: 99, Fletching: 99,
        Fishing: 99, Firemaking: 99, Crafting: 99, Smithing: 99, Mining: 99,
        Herblore: 99, Agility: 99, Thieving: 99, Slayer: 99, Farming: 99,
        Runecraft: 99, Hunter: 99, Construction: 99,
      }
    },
    "dwarf party": {
      type: "Iron man",
      color: "text-yellow-300",
      skills: {
        Attack: 76, Defence: 77, Strength: 90, Hitpoints: 84, Ranged: 75,
        Prayer: 70, Magic: 79, Cooking: 90, Woodcutting: 85, Fletching: 73,
        Fishing: 99, Firemaking: 99, Crafting: 86, Smithing: 70, Mining: 81,
        Herblore: 72, Agility: 92, Thieving: 99, Slayer: 76, Farming: 74,
        Runecraft: 66, Hunter: 83, Construction: 70,
      }
    }
  };

  const getIcon = (skill) =>
    new URL(`../assets/osrs/${skill}_icon.png`, import.meta.url).href;

  return (
    <div className="min-h-screen w-full bg-[#0d0d0d] text-gray-200 flex flex-col items-center p-6">

      {/* Back Button */}
      <button
        onClick={() => navigate("/")}
        className="self-start px-4 py-1 mb-4 rounded-md border border-[#6b623c] bg-black/40 hover:bg-black/70 hover:border-yellow-600 transition"
      >
        ← Back
      </button>

      {/* Logo with hover animation */}
      <img
        src={osrsLogo}
        alt="Old School RuneScape"
        className="w-64 mb-3 drop-shadow-[0_0_15px_rgba(0,0,0,0.8)] select-none transition-transform duration-300 hover:scale-110 hover:drop-shadow-[0_0_20px_rgba(255,215,0,0.6)]"
        draggable="false"
      />

      {/* Divider */}
      <div className="w-64 h-[2px] bg-gradient-to-r from-transparent via-yellow-600 to-transparent opacity-80 mb-6" />

      {/* Skill Cards */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8">
        {Object.entries(playerData).map(([name, data]) => {
          const total = Object.values(data.skills).reduce((a, b) => a + b, 0);

          return (
            <div
              key={name}
              className="bg-black/40 p-5 rounded-xl border border-[#6b623c] shadow-[inset_0_0_10px_rgba(0,0,0,0.8),0_0_8px_rgba(0,0,0,0.7)]"
            >
              <h2 className="text-2xl font-bold text-white mb-1 capitalize drop-shadow-sm">{name}</h2>
              <p className="text-sm text-yellow-500 mb-4">{data.type}</p>

              {/* Skills */}
              {Object.entries(data.skills).map(([skill, level]) => (
                <div
                  key={skill}
                  className="flex justify-between items-center text-base py-[5px] border-b border-[#4e482d] transition-transform duration-150 hover:bg-black/30 hover:scale-[1.01]"
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={getIcon(skill)}
                      alt={skill}
                      className="h-6 w-6"
                      style={{ imageRendering: "pixelated" }}
                    />
                    <span className="text-gray-200 drop-shadow-[0_1px_1px_black]">{skill}</span>
                  </div>
                  <span className={`${data.color} font-bold drop-shadow-[0_1px_1px_black]`}>
                    {level}
                  </span>
                </div>
              ))}

              <div className="pt-3 text-right text-yellow-400 font-bold text-base drop-shadow-[0_1px_1px_black]">
                Total Level: {total}
              </div>
            </div>
          );
        })}
      </div>

      {/* Links */}
      <div className="mt-8 flex flex-wrap gap-4 justify-center">
        <a
          href="https://secure.runescape.com/m=hiscore_oldschool/hiscorepersonal?user1=goblin+cigar"
          target="_blank"
          className="px-4 py-2 border border-[#6b623c] bg-black/30 rounded-md hover:border-yellow-600 hover:bg-black/60 transition"
        >
          Goblin Cigar Hiscores
        </a>
        <a
          href="https://secure.runescape.com/m=hiscore_oldschool_ironman/hiscorepersonal?user1=dwarf+party"
          target="_blank"
          className="px-4 py-2 border border-[#6b623c] bg-black/30 rounded-md hover:border-yellow-600 hover:bg-black/60 transition"
        >
          Dwarf Party Hiscores
        </a>
      </div>
    </div>
  );
}
