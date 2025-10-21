"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import TetrisBoard from "@/components/TetrisBoard";

export default function GameWrapper() {
  const searchParams = useSearchParams();
  const wallet = searchParams.get("wallet");

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <TetrisBoard wallet={wallet} />
    </div>
  );
}
