import React, { useEffect } from "react";

export default function ProjectModal({ project, onClose }) {
  if (!project) return null;

  // Prevent background scrolling when modal is open
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn"
      onClick={handleBackdropClick}
    >
      {/* Glassmorphic Container with Subtle Gradient Border */}
      <div className="relative w-[90vw] max-w-7xl max-h-[90vh] rounded-3xl p-[1px] bg-gradient-to-br from-white/10 via-white/5 to-transparent shadow-2xl animate-scaleIn overflow-hidden group">

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

          {/* Media Section (Left/Top) */}
          <div className="w-full md:w-3/5 relative min-h-[400px] md:min-h-full bg-black flex items-center justify-center overflow-hidden">

            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0a]/20 to-[#0a0a0a] z-10" />

            {project.video ? (
              <video
                src={project.video}
                className="w-full h-full object-contain z-0 relative"
                controls
                autoPlay
                loop
                muted
              />
            ) : project.image ? (
              <img
                src={project.image}
                alt={project.title}
                className="w-full h-full object-cover opacity-90 transition duration-700 hover:scale-105"
              />
            ) : (
              <div className="text-gray-600 flex flex-col items-center">
                <svg className="w-20 h-20 mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-mono opacity-40 tracking-widest uppercase">No Image Preview</span>
              </div>
            )}
          </div>

          {/* Content Section (Right/Bottom) */}
          <div className="w-full md:w-2/5 p-8 md:p-10 flex flex-col relative bg-gradient-to-b from-[#111111] to-[#0a0a0a]">

            {/* Title with Gradient */}
            <h2 className="text-4xl md:text-5xl font-bold mb-4 font-mono bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-500 tracking-tight">
              {project.title}
            </h2>

            {/* Tags as Glowing Pills */}
            <div className="flex flex-wrap gap-2 mb-8">
              {project.tags && project.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-xs font-mono px-3 py-1 rounded-full border border-white/10 bg-white/5 text-gray-300 shadow-[0_0_10px_rgba(255,255,255,0.02)] hover:shadow-[0_0_10px_rgba(255,255,255,0.1)] hover:border-white/20 transition-all duration-300 cursor-default"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Description */}
            <div className="prose prose-invert max-w-none mb-8 flex-grow overflow-y-auto custom-scrollbar">
              <p className="text-gray-400 leading-relaxed font-light text-lg">
                {project.details || project.desc}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-4 mt-auto pt-6 border-t border-white/5">
              {project.github && (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-6 py-3 rounded-xl bg-[#1a1a1a] hover:bg-[#252525] border border-white/5 hover:border-white/20 transition-all duration-300 group shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  <img src="/icons/github.svg" alt="" className="w-5 h-5 invert opacity-60 group-hover:opacity-100 transition-opacity" onError={(e) => e.target.style.display = 'none'} />
                  <span className="font-mono text-sm text-gray-400 group-hover:text-white transition-colors">GitHub Repo</span>
                </a>
              )}
              {project.link && (
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-r from-green-900/40 to-emerald-900/40 hover:from-green-800/60 hover:to-emerald-800/60 border border-green-500/20 hover:border-green-400/50 transition-all duration-300 group shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:-translate-y-0.5"
                >
                  <span className="font-mono text-sm text-green-400 group-hover:text-green-300 tracking-wide font-semibold">Öppna rapporten</span>
                  <svg className="w-4 h-4 text-green-500 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
