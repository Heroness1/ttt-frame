"use client";

import React, { Suspense } from "react";
import GameWrapper from "./GameWrapper";

export default function GamePage() {
  return (
    <Suspense fallback={<div className="text-center text-gray-400 mt-10">Loading game...</div>}>
      <GameWrapper />
    </Suspense>
  );
}
