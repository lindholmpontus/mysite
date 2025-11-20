import { BrowserRouter, Routes, Route } from "react-router-dom";
import Portfolio from "./Portfolio";
import Game from "./components/Game";
import Hypnotized from "./components/Hypnotized";
import Unemployedment from "./components/unemployedment";
import Hobbies from "./components/Hobbies"
import GameAchievements from "./components/GameAchievements";
import OsrsStats from "./components/OsrsStats";
import LolStats from "./components/LolStats";
import CS2Stats from "./components/CS2Stats";



function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Portfolio />} />
        <Route path="/gaming" element={<Game />} />
        <Route path="/hypnotize" element={<Hypnotized />} />
        <Route path="/unemployedment" element={<Unemployedment />} />
         <Route path="/hobbies" element={<Hobbies />} />
         <Route path="/gaming/:gameId" element={<GameAchievements />} />
         <Route path="/gaming/osrs" element={<OsrsStats />} />
         <Route path="/gaming/lol" element={<LolStats />} />
         <Route path="/gaming/cs2" element={<CS2Stats />} />



      </Routes>
    </BrowserRouter>
  );
}

export default App;
