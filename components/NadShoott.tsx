"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import TetrisMonadFlash from "../components/TetrisMonadFlash";

function NeonLogo() {
  return (
    <h1 className="text-5xl font-bold text-purple-400 neon-purple-text">
      Tetra
    </h1>
  );
}

export default function NadShoott() {
  const router = useRouter();

  useEffect(() => {
    const sound = document.getElementById("clickSound") as HTMLAudioElement | null;
    const playClickSound = () => {
      if (sound) {
        sound.currentTime = 0;
        sound.play();
      }
    };

    const buttons = document.querySelectorAll("button");
    buttons.forEach((btn) => btn.addEventListener("click", playClickSound));

    return () => {
      buttons.forEach((btn) => btn.removeEventListener("click", playClickSound));
    };
  }, []);

  return (
    <div className="text-white min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-xl bg-gray-900 border border-cyan-500 rounded-2xl shadow-lg p-6 space-y-6">

        {/* Header */}
        <header className="text-center animate-fade-in-up">
          <NeonLogo />
          <p className="text-sm text-gray-400 mt-2">Break Monad v2</p>
        </header>

        {/* Tetris neon static with fast falling animation */}
       <section className="flex justify-center">
         <TetrisMonadFlash boxSize={14} spacing={1} />
       </section>


        {/* Description */}
        <section className="text-center">
          <p className="text-gray-300"></p>
        </section>

        {/* Buttons */}
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            onClick={() => router.push("/game")}
            className="bg-cyan-500 hover:bg-cyan-600 text-black font-bold py-3 rounded transition"
          >
            Play Now
          </button>
        </section>

        {/* Footer */}
        <footer className="text-center text-xs text-gray-600 pt-4 border-t border-gray-700">
           TetraMON by Lure369.nad
        </footer>
      </div>

      <audio
        id="clickSound"
        src="https://www.soundjay.com/buttons/sounds/button-16.mp3"
        preload="auto"
      ></audio>

      {/* Extra styles */}
      <style jsx>{`
        .neon-purple-text {
          text-shadow:
            0 0 5px #bb00ff,
            0 0 10px #bb00ff,
            0 0 20px #bb00ff,
            0 0 40px #ff77ff,
            0 0 80px #ff77ff;
          color: #e600e6;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 1s ease forwards;
        }
      `}</style>
    </div>
  );
}
