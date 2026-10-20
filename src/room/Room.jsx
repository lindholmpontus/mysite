// Room.jsx — a dark room with a monitor on a desk. The monitor shows a tiny
// desktop: the browser with the site being built sits behind the terminal,
// so the visitor only catches glimpses of it until the end.
import React, { useEffect, useRef, useState } from "react";
import Site from "../site/Site";

function Clock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(t);
  }, []);
  return <span>{now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>;
}

function MenuBar() {
  return (
    <div className="menubar">
      <span className="flex gap-4 items-center">
        <b style={{ color: "var(--sage)" }}>✻</b>
        <b>agentic-web-os</b>
        <span className="hidden sm:inline">File</span>
        <span className="hidden sm:inline">Edit</span>
        <span className="hidden sm:inline">Agents</span>
      </span>
      <Clock />
    </div>
  );
}

// The site rendered at desktop width and scaled down to fit the window, so
// the glimpse looks like the real thing, just far away.
function Browser({ site, scrollRef }) {
  const bodyRef = useRef(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = bodyRef.current;
    const ro = new ResizeObserver(([e]) => setBox({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const renderW = box.w < 520 ? 430 : 980;
  const scale = box.w ? box.w / renderW : 1;

  return (
    <div className="win browser-win">
      <div className="browser-bar">
        <span className="flex gap-1.5">
          <i className="dot" style={{ background: "#ff5f57" }} />
          <i className="dot" style={{ background: "#febc2e" }} />
          <i className="dot" style={{ background: "#28c840" }} />
        </span>
        <span className="url">localhost:5173</span>
        <span className="w-10" />
      </div>
      <div ref={bodyRef} className="relative flex-1 min-h-0 overflow-hidden bg-[var(--space)]">
        <div
          ref={scrollRef}
          className="absolute left-0 top-0 overflow-y-auto overflow-x-hidden no-scrollbar"
          style={{ width: renderW, height: box.h / scale, transform: `scale(${scale})`, transformOrigin: "0 0" }}
        >
          <Site site={site} />
        </div>
      </div>
    </div>
  );
}

export default function Room({ site, stage, screenRef, roomRef, browserScrollRef, terminal, toast, chaos }) {
  const showBrowser = stage !== "intro";
  return (
    <div ref={roomRef} className={`room stage-${stage} ${chaos.comic ? "room-comic" : ""}`}>
      <div className="room-glow" aria-hidden />
      <div className="monitor">
        <div className="bezel">
          <div ref={screenRef} className="screen">
            <div className="wallpaper" aria-hidden />
            <MenuBar />
            {showBrowser && <Browser site={site} scrollRef={browserScrollRef} />}
            <div className={`win term-win tw-${stage}`}>{terminal}</div>
            {toast}
            <div className="screen-glare" aria-hidden />
          </div>
          <div className="sticky-note" aria-hidden>
            sage's computer.
            <br />
            do NOT install TURBO
          </div>
        </div>
        <div className="stand" aria-hidden />
      </div>
      <div className="desk" aria-hidden>
        <div className="keyboard" />
        <div className="mug">
          <i className="steam" />
          <i className="steam" />
          <i className="steam" />
        </div>
      </div>
    </div>
  );
}
