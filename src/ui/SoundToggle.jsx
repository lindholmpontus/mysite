// SoundToggle.jsx — the mute control. It also boots the audio engine on the
// first user gesture (browsers require that), respecting the saved preference.
import React, { useEffect, useState } from "react";
import { initAudio, resumeAudio, setMuted } from "../audio/spaceAudio";

const KEY = "journey-muted";

export default function SoundToggle() {
  const [muted, setMutedState] = useState(() => {
    if (typeof localStorage === "undefined") return false;
    return localStorage.getItem(KEY) === "1";
  });

  // boot audio on the first interaction (and apply the saved mute state)
  useEffect(() => {
    setMuted(muted);
    const boot = () => {
      initAudio();
      resumeAudio();
      setMuted(muted);
      window.removeEventListener("pointerdown", boot);
      window.removeEventListener("keydown", boot);
      window.removeEventListener("wheel", boot);
      window.removeEventListener("touchstart", boot);
    };
    window.addEventListener("pointerdown", boot);
    window.addEventListener("keydown", boot);
    window.addEventListener("wheel", boot, { passive: true });
    window.addEventListener("touchstart", boot, { passive: true });
    return () => {
      window.removeEventListener("pointerdown", boot);
      window.removeEventListener("keydown", boot);
      window.removeEventListener("wheel", boot);
      window.removeEventListener("touchstart", boot);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = () => {
    initAudio(); // clicking is itself a valid gesture
    resumeAudio();
    const next = !muted;
    setMutedState(next);
    setMuted(next);
    try {
      localStorage.setItem(KEY, next ? "1" : "0");
    } catch {
      /* ignore */
    }
  };

  return (
    <button
      onClick={toggle}
      aria-label={muted ? "Unmute sound" : "Mute sound"}
      aria-pressed={muted}
      className="fixed bottom-5 left-5 z-40 grid place-items-center w-10 h-10 rounded-lg border border-white/15 bg-black/35 backdrop-blur-md text-white/55 hover:text-white hover:border-white/40 transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M4 9v6h4l5 4V5L8 9H4z"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        {muted ? (
          <path d="M17 9l4 6M21 9l-4 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        ) : (
          <>
            <path d="M16.5 8.5a5 5 0 0 1 0 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M19 6a8.5 8.5 0 0 1 0 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </>
        )}
      </svg>
    </button>
  );
}
