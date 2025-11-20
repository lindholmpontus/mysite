import { useNavigate } from "react-router-dom";
import csImg from "../assets/cs2.jpg";
import lolImg from "../assets/lol.jpg";
import osrsImg from "../assets/osrs.jpg";

export default function Game() {
  const navigate = useNavigate();

  const games = [
    { id: "cs2", img: csImg },
    { id: "lol", img: lolImg },
    { id: "osrs", img: osrsImg },
  ];

  return (
    <div className="h-screen w-full grid grid-cols-1 md:grid-cols-3">
      {games.map((game) => (
        <div
          key={game.id}
          onClick={() => navigate(`/gaming/${game.id}`)}
          className="relative cursor-pointer group overflow-hidden border border-transparent"
          style={{
            backgroundImage: `url(${game.img})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Hover visual feedback */}
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-all duration-300" />
          
          {/* Smooth zoom effect */}
          <div className="absolute inset-0 scale-100 group-hover:scale-110 transition-transform duration-700 ease-out" />

          {/* Glow border on hover */}
          <div className="absolute inset-0 group-hover:border group-hover:border-white/70 rounded-sm transition-all duration-300" />
        </div>
      ))}
    </div>
  );
}
