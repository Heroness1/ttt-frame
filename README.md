# 🧩 TetraMON
> Mobile-first, on-chain Tetris on the Monad Testnet — where every score lives on-chain.

🎮 **Play now:** [https://ttt-frame.vercel.app]

## 🚀 Overview  
**TetraMON** is a **mobile-friendly, on-chain Tetris-style game** built for the **Monad Testnet**.  
Players can stack and clear lines in classic Tetris gameplay — and their final scores are **automatically saved on-chain** with zero gas fees or wallet pop-ups.

With **Account Abstraction** enabled by Pimlico’s Smart Accounts and Paymaster integration, TetraMON proves that **Web3 gaming can be as fast and accessible as Web2**.

---

## ⚙️ Features  
- 🎮 Classic Tetris gameplay, optimized for mobile and desktop.  
- ⚡ Gasless or minimal-gas score submission to the blockchain.  
- 📱 Mobile-first UI & responsive design.  
- 🔐 Smart contract `TETRA_SCORE` stores each player’s score permanently on-chain.  
- 🧱 Frontend built with Next.js + React + Viem for seamless blockchain interaction.

---

## 🧠 Architecture & Tech Stack
Frontend (Next.js + React + Tailwind CSS) ↓ Smart Account Mode (Pimlico / Permissionless SDK)
or
Fallback EOA Mode (Viem Wallet Client + direct transaction) ↓ Monad Testnet (Smart Contract TETRA_SCORE)

**Tech Stack:**  
- Next.js 14 (App Router)  
- React, Tailwind CSS  
- Viem + Permissionless SDK  
- Pimlico Smart Account integration  
- Solidity smart contract (Monad Testnet)  
- GitHub + Vercel for deployment
  
This project was originally based on the [Monad Farcaster Miniapp Template](https://github.com/monadxyz/monad-farcaster-miniapp-template), modified and extended for TetraMON._
