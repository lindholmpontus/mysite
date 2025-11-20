import React from "react";
import javaLogo from "../assets/java.png";
import csharpLogo from "../assets/csharp.png";
import pythonLogo from "../assets/python.png";
import reactLogo from "../assets/react.png";
import tailwindLogo from "../assets/tailwind.png";
import arcgisLogo from "../assets/arcgis.png";
import sqlLogo from "../assets/sql.png";
import phpLogo from "../assets/php.svg";
import javascriptLogo from "../assets/javascript.png";

export default function Skills() {
  const skills = [
    { logo: javaLogo, name: "Java" },
    { logo: csharpLogo, name: "C#" },
    { logo: pythonLogo, name: "Python" },
    { logo: reactLogo, name: "React" },
    { logo: tailwindLogo, name: "Tailwind" },
    { logo: arcgisLogo, name: "ArcGIS" },
    { logo: sqlLogo, name: "SQL" },
    { logo: phpLogo, name: "PHP" },
    { logo: javascriptLogo, name: "JavaScript" },
  ];

  return (
    <section className="w-full max-w-2xl bg-[#111]/80 border border-green-900/20 rounded-xl p-8 mb-16">
      <h2 className="text-green-400 text-2xl font-mono mb-5">{"$ skills"}</h2>

      <div className="grid grid-cols-3 gap-6">
        {skills.map((skill) => (
          <div
            key={skill.name}
            className="group flex flex-col items-center transition-transform duration-300 hover:scale-110"
          >
            <div className="p-2 rounded-lg transition-all duration-300 group-hover:shadow-lg group-hover:shadow-green-500/40">
              <img
                src={skill.logo}
                className="w-12 drop-shadow-sm group-hover:drop-shadow-[0_0_10px_#22c55e]"
                alt={skill.name}
              />
            </div>
            <p className="text-sm mt-2 group-hover:text-green-400 transition-colors duration-300">
              {skill.name}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
