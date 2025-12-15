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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn"
      onClick={handleBackdropClick}
    >
      <div className="bg-[#1a1a1a] border border-green-900/30 rounded-2xl w-[90vw] max-w-[90vw] max-h-[90vh] overflow-y-auto shadow-2xl relative flex flex-col md:flex-row animate-scaleIn">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/40 text-gray-400 hover:text-white hover:bg-red-900/40 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Media Section (Left/Top) */}
        <div className="w-full md:w-1/2 bg-black/40 min-h-[400px] md:min-h-full relative overflow-hidden flex items-center justify-center">
          {project.video ? (
            <video
              src={project.video}
              className="w-full h-full object-contain"
              controls
              autoPlay
              loop
              muted
            />
          ) : project.image ? (
            <img
              src={project.image}
              alt={project.title}
              className="w-full h-full object-cover opacity-90 hover:opacity-100 transition duration-500"
            />
          ) : (
            <div className="text-gray-600 flex flex-col items-center">
              <svg className="w-16 h-16 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-mono opacity-60">No Image Preview</span>
            </div>
          )}

          {/* Optional Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-[#1a1a1a]" />
        </div>

        {/* Content Section (Right/Bottom) */}
        <div className="w-full md:w-1/2 p-8 flex flex-col">
          <h2 className="text-3xl font-mono text-white mb-2 font-bold">{project.title}</h2>

          <div className="flex flex-wrap gap-2 mb-6">
            {project.tags && project.tags.map((tag, idx) => (
              <span key={idx} className="text-xs font-mono px-2 py-0.5 rounded-full border border-white/10 bg-white/5 text-gray-300">
                {tag}
              </span>
            ))}
          </div>

          <div className="prose prose-invert max-w-none mb-8 flex-grow">
            <p className="text-gray-300 leading-relaxed font-light">
              {project.details || project.desc}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mt-auto pt-4 border-t border-white/5">
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
              >
                <img src="/icons/github.svg" alt="" className="w-5 h-5 invert opacity-70 group-hover:opacity-100" onError={(e) => e.target.style.display = 'none'} />
                <span className="font-mono text-sm text-gray-300 group-hover:text-white">GitHub Repo</span>
              </a>
            )}
            {project.link && (
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-green-900/20 hover:bg-green-900/30 border border-green-700/50 hover:border-green-500 transition-all group"
              >
                <span className="font-mono text-sm text-green-400 group-hover:text-green-300">Öppna rapporten</span>
                <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
