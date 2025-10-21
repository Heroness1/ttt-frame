"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ethers } from "ethers";
import TetrisMonadFlash from "../../components/TetrisMonadFlash";

function GameContent() {
  const searchParams = useSearchParams();
  const [wallet, setWallet] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  // ✅ Connect wallet + fetch score (READ only)
  useEffect(() => {
    (async () => {
      try {
        const ethereum = (window as any).ethereum;
        if (!ethereum) throw new Error("MetaMask not found");

        const provider = new ethers.BrowserProvider(ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        const address = ethers.getAddress(accounts[0]);
        setWallet(address);

        const res = await fetch("/frame", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            untrustedData: { requester_wallet_address: address },
          }),
        });

        const data = await res.json();
        const url = new URL(data["frame:image"]);
        const userScore = url.searchParams.get("score");
        setScore(Number(userScore));
        setMsg("🎮 Score synced from blockchain");
      } catch (err) {
        console.error("Failed to load score:", err);
        setMsg("⚠️ Failed to fetch score");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ✅ Manual save score ke chain
  async function saveScore() {
    if (!wallet) return setMsg("⚠️ Wallet not connected");

    try {
      setMsg("⏳ Saving score...");
      // nanti lo bisa dapet real score dari game
      const finalScore = Math.floor(Math.random() * 500); // dummy sementara
      const res = await fetch("/api/save-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet, score: finalScore }),
      });

      const data = await res.json();
      if (data.success) {
        setMsg(`✅ Score ${finalScore} saved to chain!`);
        setScore(finalScore);
      } else {
        throw new Error(data.error || "Failed to save score");
      }
    } catch (err) {
      console.error("❌ Save failed:", err);
      setMsg("❌ Failed to save score");
    }
  }

  return (
    <div className="text-white min-h-screen flex flex-col items-center justify-center bg-[#0a0b0d] px-4">
      <div className="w-full max-w-xl bg-gray-900 border border-cyan-500 rounded-2xl shadow-lg p-6 space-y-6">
        <header className="text-center">
          <h1 className="text-4xl font-bold text-purple-400 neon-purple-text">
            TetraMON Game
          </h1>
          <p className="text-sm text-pink-400 mt-2">On-chain Gaming</p>
        </header>

        <section className="flex justify-center">
          <TetrisMonadFlash boxSize={14} spacing={1} />
        </section>

        {loading ? (
          <p className="text-center text-gray-400 mt-4">Loading score...</p>
        ) : (
          <div className="text-center mt-4">
            {wallet && (
              <p className="text-green-400 text-sm mb-2">
                ✅ Wallet: {wallet.slice(0, 6)}...{wallet.slice(-4)}
              </p>
            )}
            {score !== null ? (
              <p className="text-2xl font-bold text-cyan-300">
                🧬 Current Score: {score}
              </p>
            ) : (
              <p className="text-red-400 text-sm">No score found</p>
            )}
          </div>
        )}

        {/* 🔘 Save Score button */}
        <div className="flex justify-center mt-4">
          <button
            onClick={saveScore}
            disabled={loading || !wallet}
            className={`px-6 py-2 rounded-xl font-semibold transition ${
              loading || !wallet
                ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-700 text-white shadow-lg"
            }`}
          >
            Save Score
          </button>
        </div>

        {msg && <p className="text-center text-sm text-gray-400 mt-3">{msg}</p>}

        <footer className="text-center text-xs text-gray-600 pt-4 border-t border-gray-700">
          Powered by Monad • Gasless via Pimlico
        </footer>
      </div>
    </div>
  );
}

export default function GamePage() {
  return (
    <Suspense fallback={<div className="text-center text-gray-400 mt-10">Loading...</div>}>
      <GameContent />
    </Suspense>
  );
}
