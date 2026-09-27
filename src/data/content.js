// content.js — all portfolio copy in English, in one place.
import javaLogo from "../assets/java.png";
import pythonLogo from "../assets/python.png";
import gitLogo from "../assets/git.png";
import javascriptLogo from "../assets/javascript.png";
import fabricLogo from "../assets/Fabric_final_x256.png";
import sparkLogo from "../assets/Apache_Spark_logo.svg.png";
import azureLogo from "../assets/Microsoft_Azure.svg.png";
import powerAutomateLogo from "../assets/Microsoft_Power_Automate.svg.png";
import claudeLogo from "../assets/Claude_AI_symbol.svg.png";

import guitarImg from "../assets/guitar.png";
import gamingImg from "../assets/gaming.jpg";
import gymImg from "../assets/gym.jpg";
import sleepImg from "../assets/sleep.png";

export const PROFILE = {
  name: "Pontus Lindholm",
  title: "Data & AI Engineer",
  location: "Gävle, Sweden",
  age: 26,
  cv: "/Pontus_Lindholm_CV.pdf",
  email: "lindholmpontus@outlook.com",
  phone: "070-778 30 65",
  linkedin: "https://www.linkedin.com/in/pontus-lindholm-170708368",
  github: "https://github.com/lindholmpontus",
  company: "Sogeti",
  // About me — the profile from the (English) CV
  intro: "Data & AI Engineer at Sogeti in Gävle with a Bachelor's degree in computer science.",
  about: [
    "Data & AI Engineer at Sogeti in Gävle with a Bachelor's degree in computer science. I work on a client assignment where I deliver use cases, develop their data platform in Microsoft Fabric and build AI-related solutions.",
    "Curious by nature, I like understanding how things work and finding simple, sustainable solutions. Social too — happiest working closely with others, preferably on-site and in environments where people learn from each other.",
  ],
  languages: "Swedish · English",
};

export const SKILLS = [
  { logo: fabricLogo, name: "Microsoft Fabric" },
  { logo: sparkLogo, name: "Apache Spark" },
  { logo: azureLogo, name: "Azure" },
  { logo: powerAutomateLogo, name: "Power Automate" },
  { logo: claudeLogo, name: "Claude AI" },
  { logo: javaLogo, name: "Java" },
  { logo: pythonLogo, name: "Python" },
  { logo: javascriptLogo, name: "JavaScript" },
  { logo: gitLogo, name: "Git" },
];

// Career + education (from the English CV), newest first, on one planet.
export const EXPERIENCE = [
  {
    org: "Sogeti",
    place: "Gävle",
    roles: [
      {
        title: "Data & AI Engineer",
        period: "Sept. 2026 – present",
        points: [
          "After CareerBooster the client chose to keep me on full-time, following strong feedback — building further on their data platform in Microsoft Fabric.",
          "Deliver use cases together with the business: from need to data pipelines, data quality and data people can base decisions on (Python, SQL and Spark).",
          "Push AI-driven development: shaping the platform and our ways of working to be AI-native, with the structure and quality checks that turn new technology into real value for the client.",
        ],
      },
      {
        title: "CareerBooster · Data & AI Engineer",
        period: "March 2026 – Sept. 2026",
        points: [
          "Sogeti's national Data & AI trainee programme — with most of my time on a real client project from day one, developing their data platform.",
          "Developed a machine learning model forecasting product demand for another client.",
          "Training in AI, data engineering and the consultant role alongside the client work.",
        ],
      },
    ],
  },
];

export const EDUCATION = [
  {
    degree: "Bachelor's Degree in Computer Science",
    school: "University of Gävle",
    period: "Aug. 2022 – June 2025",
    points: ["Thesis at Lantmäteriet: GraalVM Native Image vs JVM — performance & resource analysis."],
  },
];

export const HOBBIES = [
  {
    title: "Guitar",
    image: guitarImg,
    text: "Nothing beats some old classic rock and roll. Stevie Ray Vaughan, Jimi Hendrix and Pink Floyd are among my favorites.",
  },
  {
    title: "Gaming",
    image: gamingImg,
    text: "League of Legends, Counter-Strike and Old School RuneScape.",
  },
  {
    title: "Gym",
    image: gymImg,
    text: "On and off, consitency in the gym is my enemy 😂",
  },
  {
    title: "Napping",
    image: sleepImg,
    text: "self explained",
  },
];
