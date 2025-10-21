"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import TetrisBoard from "../../components/TetrisBoard";

export default function GamePage() {
  const searchParams = useSearchParams();
  const wallet = searchParams.get("wallet");

  return (
    <div className="text-white min-h-screen flex items-center justify-center bg-[#0a0b0d] px-4">
      <div className="w-full max-w-xl bg-gray-900 border border-cyan-500 rounded-2xl shadow-lg p-6 space-y-6">
        <header className="text-center">
          <h1 className="text-3xl font-bold text-purple-400">
            TetraMON Game
          </h1>
          {wallet && (
            <p className="text-sm text-gray-400 mt-2">
              Connected wallet: {wallet.slice(0, 6)}...{wallet.slice(-4)}
            </p>
          )}
        </header>

        {/* 🎮 Render Tetris board game */}
        <section className="flex justify-center">
          <TetrisBoard wallet={wallet} />
        </section>

        <footer className="text-center text-xs text-gray-600 pt-4 border-t border-gray-700">
          Powered by Monad • Gasless via Pimlico
        </footer>
      </div>
    </div>
  );
}
