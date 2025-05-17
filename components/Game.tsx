import React from "react";
import TetrisBoard from "../components/TetrisBoard";

export default function GamePage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <TetrisBoard />
    </div>
  );
}
