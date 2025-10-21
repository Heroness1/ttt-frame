"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ethers } from "ethers";
import TetrisMonadFlash from "../components/TetrisMonadFlash";

export default function NadShoott() {
  const router = useRouter();
  const typewriterRef = useRef<HTMLParagraphElement>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const text = "MONAD MAXI";

  async function connectWallet() {
    try {
      setConnecting(true);
      if (!window.ethereum) {
        alert("Please install MetaMask or use a Web3 browser");
        return;
      }
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const address = ethers.getAddress(accounts[0]);
      setAccount(address);
      setMsg(`✅ Connected: ${address.slice(0, 6)}...${address.slice(-4)}`);
    } catch (err) {
      console.error("Connection failed:", err);
      alert("Failed to connect wallet");
    } finally {
      setConnecting(false);
    }
  }

  async function handlePlay() {
    if (!account) return setMsg("Please connect your wallet first!");
    setLoading(true);
    setMsg("Saving score to blockchain...");
    try {
      const res = await fetch("/frame", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          untrustedData: { requester_wallet_address: account },
        }),
      });

      if (!res.ok) throw new Error("Failed to save score");

      const data = await res.json();
      const url = new URL(data["frame:image"]);
      const score = url.searchParams.get("score");
      setMsg(`🎮 Score saved: ${score}`);
      setTimeout(() => router.push("/game"), 1200);
    } catch (err) {
      console.error("Play error:", err);
      setMsg("❌ Failed to save score");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="text-white min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-xl bg-gray-900 border border-cyan-500 rounded-2xl shadow-lg p-6 space-y-6">
        <header className="text-center">
          <h1 className="text-5xl font-bold text-purple-400 neon-purple-text">
            Tetra
          </h1>
          <p ref={typewriterRef} className="text-sm mt-2 text-pink-400">
            {text}
          </p>
        </header>

        <section className="flex justify-center">
          <TetrisMonadFlash boxSize={14} spacing={1} />
        </section>

        {!account ? (
          <button
            onClick={connectWallet}
            disabled={connecting}
            className="mx-auto block bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold py-3 px-6 rounded-2xl shadow-[0_0_10px_rgba(0,255,255,0.6)] hover:shadow-[0_0_20px_rgba(0,255,255,0.9)] transition duration-300"
          >
            {connecting ? "Connecting..." : "Connect Wallet"}
          </button>
        ) : (
          <p className="text-center text-green-400 text-sm">
            ✅ {account.slice(0, 6)}...{account.slice(-4)}
          </p>
        )}

        {account && (
          <section className="grid grid-cols-1 sm:grid-cols-2 max-w-md mx-auto gap-3 justify-center mt-3">
            <button
              onClick={handlePlay}
              disabled={loading}
              className={`bg-cyan-500 hover:bg-cyan-600 text-black font-bold py-3 rounded-2xl transition duration-300 ${
                loading
                  ? "opacity-60 cursor-not-allowed"
                  : "shadow-[0_0_10px_rgba(0,255,255,0.7)] hover:shadow-[0_0_20px_rgba(0,255,255,0.9)]"
              }`}
            >
              {loading ? "Saving..." : "Play Now"}
            </button>
          </section>
        )}

        {msg && (
          <p className="text-center text-sm mt-2 text-gray-300">{msg}</p>
        )}

        <footer className="text-center text-xs text-gray-600 pt-4 border-t border-gray-700">
          TetraMON by Lure369.nad
        </footer>
      </div>
    </div>
  );
}
