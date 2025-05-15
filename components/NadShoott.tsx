// components/NadShoott.tsx
"use client";

import React, { useEffect } from "react";

export default function NadShoott() {
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
  <h1 className="text-5xl font-bold text-purple-400 neon-purple-text">NadShoott</h1>
  <p className="text-sm text-gray-400 mt-2">shhhoot!!</p>
</header>

        {/* Floating image */}
        <section className="animate-float">
          <img src="https://via.placeholder.com/600x300/111111/00ffff?text=Shooter+Gameplay"
               alt="Game Preview"
               className="rounded-lg border border-cyan-400 shadow-md w-full" />
        </section>

        {/* Description */}
        <section className="text-center">
          <p className="text-gray-300">
            Shoot your load!.
          </p>
        </section>

        {/* Buttons */}
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button className="bg-cyan-500 hover:bg-cyan-600 text-black font-bold py-3 rounded transition">
            Play Now
          </button>
          <button className="border border-cyan-500 text-cyan-400 hover:bg-cyan-800 py-3 rounded transition">
            How it Works
          </button>
        </section>

        {/* Footer */}
        <footer className="text-center text-xs text-gray-600 pt-4 border-t border-gray-700">
          © 2025 NadShoott. All rights reserved.
        </footer>
      </div>

      <audio id="clickSound" src="https://www.soundjay.com/buttons/sounds/button-16.mp3" preload="auto"></audio>

      {/* Extra styles */}
      <style jsx>{`
        .neon-text {
          text-shadow:
            0 0 5px #00ffff,
            0 0 10px #00ffff,
            0 0 20px #00ffff,
            0 0 40px #00ffff;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
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
