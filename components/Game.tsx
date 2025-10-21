"use client";
import React from "react";
import TetrisBoard from "./TetrisBoard";
import { useSearchParams } from "next/navigation";

export default function Game() {
  const searchParams = useSearchParams();
  const wallet = searchParams.get("wallet"); // ambil wallet dari URL (misal /game?wallet=0x123)

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <TetrisBoard wallet={wallet} />
    </div>
  );
}
