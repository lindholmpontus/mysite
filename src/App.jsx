// App.jsx — route between the scroll-driven space journey and the accessible
// 2D summary. No WebGL or prefers-reduced-motion lands on the summary by
// default (with an opt-in back to the journey where possible).
import React, { useMemo, useState } from "react";
import JourneyPage from "./journey/JourneyPage";
import SummaryPage from "./pages/SummaryPage";
import { hasWebGL, prefersReducedMotion } from "./journey/journeyConfig";

export default function App() {
  const webgl = useMemo(() => hasWebGL(), []);
  const reduced = useMemo(() => prefersReducedMotion(), []);
  const [mode, setMode] = useState(() => (!webgl || reduced ? "summary" : "journey"));

  const switchTo = (next) => {
    window.scrollTo(0, 0);
    setMode(next);
  };

  if (mode === "summary") {
    return <SummaryPage canFly={webgl} onEnterFlight={() => switchTo("journey")} />;
  }

  return <JourneyPage onExitToSummary={() => switchTo("summary")} />;
}
