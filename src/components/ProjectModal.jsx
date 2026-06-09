import React, { useEffect } from "react";

export default function ProjectModal({ project, onClose }) {
  // Prevent background scrolling while the modal is open. (Hook must run on every
  // render — the null-project guard happens after the hooks.)
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!project) return null;

  // only projects with a demo video get the big media panel; everything else is
  // a clean, content-first modal (no empty screenshot placeholder)
  const wide = !!project.video;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn"
      onClick={handleBackdropClick}
    >
      <div
        className={`relative w-[92vw] ${wide ? "max-w-6xl" : "max-w-2xl"} max-h-[90vh] rounded-3xl p-[1px] bg-gradient-to-br from-white/10 via-white/5 to-transparent shadow-2xl animate-scaleIn overflow-hidden group`}
      >
        <div className="bg-[#0a0a0a]/95 backdrop-blur-xl rounded-3xl w-full h-full overflow-y-auto flex flex-col md:flex-row relative">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/50 text-white/50 hover:text-white hover:bg-red-500/20 transition-all duration-300 backdrop-blur-sm border border-white/5 group-hover:border-white/10"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Media Section — only when there's a demo video */}
          {wide && (
            <div className="w-full md:w-3/5 relative min-h-[300px] md:min-h-full bg-black flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0a]/20 to-[#0a0a0a] z-10 pointer-events-none" />
              <video
                src={project.video}
                className="w-full h-full object-contain z-0 relative"
                controls
                autoPlay
                loop
                muted
              />
            </div>
          )}

          {/* Content Section */}
          <div className={`${wide ? "w-full md:w-2/5" : "w-full"} p-8 md:p-10 flex flex-col relative bg-gradient-to-b from-[#111111] to-[#0a0a0a]`}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-mono bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-500 tracking-tight">
              {project.title}
            </h2>

            <div className="flex flex-wrap gap-2 mb-6">
              {project.tags &&
                project.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-mono px-3 py-1 rounded-full border border-white/10 bg-white/5 text-gray-300 hover:border-white/20 transition-all duration-300 cursor-default"
                  >
                    {tag}
                  </span>
                ))}
            </div>

            <div className="prose prose-invert max-w-none mb-8 flex-grow overflow-y-auto custom-scrollbar">
              <p className="text-gray-300 leading-relaxed font-light text-base md:text-lg">
                {project.details || project.desc}
              </p>
            </div>

            {/* Action Buttons */}
            {(project.github || project.link) && (
              <div className="flex flex-wrap gap-4 mt-auto pt-6 border-t border-white/5">
                {project.github && (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-6 py-3 rounded-xl bg-[#1a1a1a] hover:bg-[#252525] border border-white/5 hover:border-white/20 transition-all duration-300 group shadow-lg hover:-translate-y-0.5"
                  >
                    <span className="font-mono text-sm text-gray-400 group-hover:text-white transition-colors">GitHub repo ↗</span>
                  </a>
                )}
                {project.link && (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-r from-green-900/40 to-emerald-900/40 hover:from-green-800/60 hover:to-emerald-800/60 border border-green-500/20 hover:border-green-400/50 transition-all duration-300 group hover:-translate-y-0.5"
                  >
                    <span className="font-mono text-sm text-green-300 tracking-wide font-semibold">Open ↗</span>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
