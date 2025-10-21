"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ethers } from "ethers";
import TetrisMonadFlash from "../../components/TetrisMonadFlash";

// 🔹 tambahin ini paling atas biar TypeScript gak error
declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function GamePage() {
  const searchParams = useSearchParams();
  const [wallet, setWallet] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      try {
        // ✅ tambahin tanda seru biar compiler yakin window.ethereum ada
        const provider = new ethers.BrowserProvider(window.ethereum!);
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

        {msg && (
          <p className="text-center text-sm text-gray-400 mt-3">{msg}</p>
        )}

        <footer className="text-center text-xs text-gray-600 pt-4 border-t border-gray-700">
          Powered by Monad • Gasless via Pimlico
        </footer>
      </div>
    </div>
  );
}
