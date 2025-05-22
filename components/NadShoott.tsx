"use client";

import React, { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import TetrisMonadFlash from "../components/TetrisMonadFlash";

// Tambahkan import ready
import { ready } from "@farcaster/miniapps-sdk";

function NeonLogo() {
  return (
    <h1 className="text-5xl font-bold text-purple-400 neon-purple-text">
      Tetra
    </h1>
  );
}

export default function NadShoott() {
  const router = useRouter();
  const typewriterRef = useRef<HTMLParagraphElement>(null);
  const text = "Break Monad v2";

  useEffect(() => {
    // Panggil ready() di sini sekali saat komponen mount
    ready();

    const sound = document.getElementById("clickSound") as HTMLAudioElement | null;
    const playClickSound = () => {
      if (sound) {
        sound.currentTime = 0;
        sound.play();
      }
    };
    const buttons = document.querySelectorAll("button");
    buttons.forEach((btn) => btn.addEventListener("click", playClickSound));
    return () => buttons.forEach((btn) => btn.removeEventListener("click", playClickSound));
  }, []);

  useEffect(() => {
    const delay = 1000;
    const timeout = setTimeout(() => {
      const el = typewriterRef.current;
      if (!el) return;
      let index = 0;
      el.textContent = "";
      const interval = setInterval(() => {
        el.textContent += text.charAt(index);
        index++;
        if (index === text.length) clearInterval(interval);
      }, 100);
    }, delay);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="text-white min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-xl bg-gray-900 border border-cyan-500 rounded-2xl shadow-lg p-6 space-y-6">

        <header className="text-center animate-fade-in-up">
          <NeonLogo />
          <p className="text-sm mt-2 hot-pink-text" ref={typewriterRef}></p>
        </header>

        <section className="flex justify-center">
          <TetrisMonadFlash boxSize={14} spacing={1} />
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 max-w-md mx-auto gap-3 justify-center">
          <button
            onClick={() => router.push("/game")}
            className="
              bg-cyan-500 
              hover:bg-cyan-600 
              text-black 
              font-bold 
              py-3 
              rounded-2xl 
              shadow-[0_0_10px_rgba(0,255,255,0.7)] 
              hover:shadow-[0_0_20px_rgba(0,255,255,0.9)] 
              transition 
              duration-300
            "
          >
            Play Now
          </button>
        </section>

        <footer className="text-center text-xs text-gray-600 pt-4 border-t border-gray-700">
          TetraMON by Lure369.nad
        </footer>
      </div>

      <audio
        id="clickSound"
        src="https://www.soundjay.com/buttons/sounds/button-16.mp3"
        preload="auto"
      ></audio>

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

        .hot-pink-text {
          color: #FF69B4;
          text-shadow:
            0 0 5px #FF69B4,
            0 0 10px #FF69B4;
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
