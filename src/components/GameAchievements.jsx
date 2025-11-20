import { useParams, useNavigate } from "react-router-dom";


export default function GameAchievements() {
  const { gameId } = useParams();
  const navigate = useNavigate();

  const titles = {
    cs2: "Counter-Strike 2",
    lol: "League of Legends",
    osrs: "Old School RuneScape",
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 to-black text-gray-200 flex flex-col items-center p-6">

      <button
        onClick={() => navigate("/gaming")}
        className="self-start px-4 py-1 mb-6 rounded-full border border-gray-600 hover:bg-gray-700 transition"
      >
        ← Back
      </button>

      <h1 className="text-4xl font-bold mb-10 text-white">
        {titles[gameId] || "Achievements"}
      </h1>

      <div className="w-full max-w-2xl space-y-8">
        <section className="p-6 rounded-xl border border-gray-700 bg-gray-800/40 shadow hover:shadow-lg hover:-translate-y-0.5 transition">
          <p>• Add your achievements, stats, moments, screenshots, clips etc.</p>
        </section>
      </div>
    </div>
  );
}
