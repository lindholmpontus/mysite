import React, { useState, useEffect } from "react";
import pcImage from "../assets/computer-screen.svg";
import { useNavigate } from "react-router-dom";

import guitarImg from "../assets/guitar.png";
import gamingImg from "../assets/gaming.jpg";
import gymImg from "../assets/gym.jpg";
import windowsBg from "../assets/windows.jpg";
import sleepImg from "../assets/sleep.png";

export default function Hobbies() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [autoTypingDone, setAutoTypingDone] = useState(false);
    const [playBounce, setPlayBounce] = useState(false);
    const [showDesktop, setShowDesktop] = useState(false);
    const navigate = useNavigate();

    const [autoOpenFolder, setAutoOpenFolder] = useState(false);
    const [startSlideshow, setStartSlideshow] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    const hobbies = [
        { img: guitarImg, text: "Spela gitarr" },
        { img: gamingImg, text: "Gamea" },
        { img: gymImg, text: "Gymma" },
        { img: sleepImg, text: "Vakna från nap" }
    ];

    // ---- AUTO TYPE EFFECT ----
    useEffect(() => {
        let timer;

        const typeUsername = async () => {
            const text = "pontus-lindholm-pc";
            for (let i = 0; i < text.length; i++) {
                await new Promise((res) => {
                    timer = setTimeout(() => {
                        setUsername((prev) => prev + text[i]);
                        res();
                    }, 120);
                });
            }
        };

        const typePassword = async () => {
            const text = "12345555555555555555555";
            for (let i = 0; i < text.length; i++) {
                await new Promise((res) => {
                    timer = setTimeout(() => {
                        setPassword((prev) => prev + text[i]);
                        res();
                    }, 90);
                });
            }
        };

        const run = async () => {
            await typeUsername();
            await new Promise((res) => setTimeout(res, 250));
            await typePassword();
            setAutoTypingDone(true);

            setTimeout(() => {
                setPlayBounce(true);
            }, 300);
        };

        run();
        return () => clearTimeout(timer);
    }, []);

    // ---- SHOW DESKTOP ----
    useEffect(() => {
        if (playBounce) {
            const t = setTimeout(() => {
                setShowDesktop(true);

                // --- WAIT BEFORE ICON BOUNCE ---
                setTimeout(() => {
                    setAutoOpenFolder(true);
                }, 1200);

            }, 500);

            return () => clearTimeout(t);
        }
    }, [playBounce]);

    // ---- AFTER ICON BOUNCE, START SLIDESHOW ----
    useEffect(() => {
        if (!autoOpenFolder) return;

        const openDelay = setTimeout(() => {
            setStartSlideshow(true);
        }, 1000);

        return () => clearTimeout(openDelay);
    }, [autoOpenFolder]);

    // ---- SLIDESHOW ----
    useEffect(() => {
        if (!startSlideshow) return;

        let index = 0;
        const interval = setInterval(() => {
            index++;

            if (index >= hobbies.length) {
                clearInterval(interval);

                // 🔙 GÅ TILLBAKA EFTER SISTA BILDEN
                setTimeout(() => {
                    setStartSlideshow(false);
                    setAutoOpenFolder(false);
                }, 1500);

            } else {
                setCurrentIndex(index);
            }

        }, 1800);

        return () => clearInterval(interval);
    }, [startSlideshow]);



    return (
        <div
            className="h-screen w-screen flex items-center justify-center relative"
            style={{
                background: "linear-gradient(135deg, #0d0d0d 0%, #1a1a1a 100%)"
            }}
        >
            {/* Exit-button */}
            <button
                onClick={() => navigate(-1)}
                className="absolute top-4 left-4 border border-white text-white px-4 py-1 rounded font-mono hover:bg-white hover:text-black transition"
            >
                {">"} Exit
            </button>

            <div className="relative">
                <img
                    src={pcImage}
                    alt="pixel pc"
                    className="w-[550px] mx-auto select-none"
                    draggable="false"
                />

                {/* LOGIN OVERLAY */}
                <div
                    className="absolute overflow-hidden"
                    style={{
                        top: "17.2%",
                        left: "20.3%",
                        width: "59.4%",
                        height: "40.6%",
                        background: "#050608",
                        border: "1px solid #222",
                        fontFamily: "monospace",
                        padding: "12px",
                        transition: "opacity 0.4s ease",
                        opacity: showDesktop ? 0 : 1,
                        pointerEvents: showDesktop ? "none" : "auto"
                    }}
                >
                    <div className="flex flex-col justify-center items-center text-white h-full">
                        <h2 className="text-center text-lg mb-4">LOGIN REQUIRED</h2>

                        <input
                            type="text"
                            className="bg-[#111] border border-gray-600 text-white px-2 py-1 mb-2 w-full outline-none text-sm"
                            value={username}
                            readOnly
                        />

                        <input
                            type="password"
                            className="bg-[#111] border border-gray-600 text-white px-2 py-1 mb-3 w-full outline-none text-sm"
                            value={password}
                            readOnly
                        />

                        <button
                            className={`bg-white text-black font-bold py-1 w-full text-sm transition 
                                ${playBounce ? "one-bounce" : autoTypingDone ? "" : "opacity-50"}`}
                        >
                            ENTER
                        </button>
                    </div>
                </div>

                {/* DESKTOP + SLIDESHOW */}
                <div
                    className="absolute flex flex-col text-white"
                    style={{
                        top: "17.2%",
                        left: "20.3%",
                        width: "59.4%",
                        height: "40.6%",
                        backgroundImage: `url(${windowsBg})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        opacity: showDesktop ? 1 : 0,
                        transition: "opacity 0.4s ease",
                        overflow: "hidden"
                    }}
                >

                    {/* Ikon */}
                    {!startSlideshow && (
                        <div
                            className={`flex flex-col items-center w-16 gap-1 mt-3 ml-3 transition ${autoOpenFolder ? "icon-bounce" : ""
                                }`}
                        >
                            <div className="text-3xl">🗂️</div>
                            <p className="text-xs text-center leading-tight">
                                Mina_<br />Intressen
                            </p>
                        </div>
                    )}

                    {/* SLIDESHOW */}
                    {startSlideshow && (
                        <div className="absolute inset-0">
                            <img
                                src={hobbies[currentIndex].img}
                                alt="hobby"
                                className="w-full h-full object-cover animate-fadeZoom"
                            />
                            <div className="absolute bottom-3 left-0 w-full text-center text-2xl font-bold flame-text">
                                {hobbies[currentIndex].text}
                            </div>

                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes oneBounce {
                  0% { transform: scale(1); }
                  40% { transform: scale(0.92); }
                  100% { transform: scale(1); }
                }
                .one-bounce { animation: oneBounce 0.45s ease forwards; }

                @keyframes iconBounce {
                  0% { transform: scale(1); }
                  35% { transform: scale(1.15); }
                  100% { transform: scale(1); }
                }
                .icon-bounce { animation: iconBounce 0.4s ease forwards; }

                @keyframes fadeZoom {
                  0% { opacity: 0; transform: scale(1.12); }
                  100% { opacity: 1; transform: scale(1); }
                }
                .animate-fadeZoom { animation: fadeZoom 0.9s ease forwards; }

                @keyframes textFade {
                  0% { opacity: 0; }
                  100% { opacity: 1; }
                }
                .animate-textFade { animation: textFade 0.8s ease forwards; }
            `}</style>
        </div>
    );
}
