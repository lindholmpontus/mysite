// HobbiesSection.jsx — clean image grid of interests.
import React from "react";
import { HOBBIES } from "../data/content";

export default function HobbiesSection({ accent }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {HOBBIES.map((h) => (
        <div
          key={h.title}
          className="relative rounded-xl overflow-hidden border group h-40"
          style={{ borderColor: `${accent}33` }}
        >
          <img
            src={h.image}
            alt={h.title}
            className="absolute inset-0 w-full h-full object-cover opacity-55 group-hover:opacity-75 group-hover:scale-105 transition duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          <div className="absolute inset-0 p-4 flex flex-col justify-end">
            <h4 className="font-mono text-base text-white" style={{ textShadow: `0 0 12px ${accent}` }}>
              {h.title}
            </h4>
            <p className="text-gray-300 text-xs font-light mt-1 leading-snug">{h.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
