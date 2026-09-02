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
  intro:
    "I work as a Data & AI Engineer and love software development just as much. I'm curious about technology and learning new things. The best part about work is bringing real ideas to life.",
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

// Career + education, newest first, shown together on one planet.
export const CAREER = [
  {
    kind: "work",
    role: "Data & AI Engineer",
    org: "Sogeti",
    place: "Gävle, Sweden",
    period: "Mar 2026 – Present",
    points: [
      "Helping customers build data platforms, AI solutions and modern software applications",
      "Joined through Sogeti's CareerBooster program.",
    ],
  },
  {
    kind: "education",
    role: "Bachelor's Degree in Computer Science",
    org: "University of Gävle",
    place: "Gävle, Sweden",
    period: "Graduated 2026",
    points: [
      "Thesis at Lantmäteriet: GraalVM Native Image vs JVM — performance & resource analysis.",
      "Courses in software development, databases, mathematics, and more.",
    ],
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
