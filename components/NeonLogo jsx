import React from "react";

export default function NeonLogo() {
  return (
    <>
      <h1 className="text-6xl font-extrabold text-cyan-400 neon-text flicker">TetraMON</h1>
      <style jsx>{`
        .neon-text {
          color: #0ff;
          text-shadow:
            0 0 5px #0ff,
            0 0 10px #0ff,
            0 0 20px #0ff,
            0 0 40px #0ff,
            0 0 80px #0ff;
        }
        @keyframes flicker {
          0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% {
            opacity: 1;
            text-shadow:
              0 0 5px #0ff,
              0 0 10px #0ff,
              0 0 20px #0ff,
              0 0 40px #0ff,
              0 0 80px #0ff;
          }
          20%, 22%, 24%, 55% {
            opacity: 0.4;
            text-shadow: none;
          }
        }
        .flicker {
          animation: flicker 3s infinite;
        }
      `}</style>
    </>
  );
}
