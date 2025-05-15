"use client";

import React, { useState, useEffect, useRef } from "react";
import Player from "./Player";
import Zombie from "./Zombie";
import Controls from "./Controls";

const stages = 5;

export default function Game() {
  // Game state
  const [stage, setStage] = useState(1);
  const [time, setTime] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [playerPos, setPlayerPos] = useState({ x: 50, y: 100 });
  const [zombies, setZombies] = useState<{ x: number; y: number; id: number }[]>([]);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Start timer on game start
  useEffect(() => {
    if (!gameOver) {
      startTimeRef.current = performance.now();
      timerRef.current = window.setInterval(() => {
        if (startTimeRef.current)
          setTime((performance.now() - startTimeRef.current) / 1000);
      }, 100);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [stage, gameOver]);

  // Spawn zombies per stage
  useEffect(() => {
    // simple spawn: stage * 3 zombies
    const newZombies = [];
    for (let i = 0; i < stage * 3; i++) {
      newZombies.push({ x: 400 + i * 60, y: 100, id: i });
    }
    setZombies(newZombies);
  }, [stage]);

  // Advance stage logic (example)
  useEffect(() => {
    if (gameOver) return;
    if (zombies.length === 0 && stage < stages) {
      setStage(stage + 1);
    }
    if (zombies.length === 0 && stage === stages) {
      setGameOver(true);
    }
  }, [zombies, stage, gameOver]);

  // Simple player move handler
  const movePlayer = (dx: number) => {
    setPlayerPos((pos) => ({ x: Math.max(0, pos.x + dx), y: pos.y }));
  };

  // Shoot logic (example: remove one zombie)
  const shoot = () => {
    setZombies((z) => z.slice(1));
  };

  // Restart game
  const restart = () => {
    setStage(1);
    setTime(0);
    setGameOver(false);
  };

  // Share time to Warpcast frame (just URL with time param)
  const shareToWarpcast = () => {
    const url = `https://warpcast.com/frame?title=NadShoott%20TimeAttack&time=${time.toFixed(2)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="relative w-full max-w-4xl h-[400px] mx-auto bg-gradient-to-b from-purple-900 via-purple-700 to-purple-900 rounded-lg overflow-hidden p-4 text-white font-mono select-none">
      <div className="absolute top-4 left-4 text-lg font-bold">
        Stage: {stage} / {stages}
      </div>
      <div className="absolute top-4 right-4 text-lg font-bold">
        Time: {time.toFixed(2)}s
      </div>

      {/* Game Area */}
      <div className="relative w-full h-full bg-purple-900 rounded-lg overflow-hidden">
        <Player x={playerPos.x} y={playerPos.y} />
        {zombies.map((z) => (
          <Zombie key={z.id} x={z.x} y={z.y} />
        ))}
      </div>

      {/* Controls */}
      {!gameOver && (
        <Controls
          onLeft={() => movePlayer(-10)}
          onRight={() => movePlayer(10)}
          onShoot={shoot}
        />
      )}

      {/* Game Over */}
      {gameOver && (
        <div className="absolute inset-0 bg-purple-900 bg-opacity-90 flex flex-col items-center justify-center space-y-4">
          <h2 className="text-3xl font-bold">Stage Complete!</h2>
          <p>Your time: {time.toFixed(2)} seconds</p>
          <button
            onClick={restart}
            className="px-6 py-2 bg-purple-600 rounded hover:bg-purple-700"
          >
            Restart
          </button>
          <button
            onClick={shareToWarpcast}
            className="px-6 py-2 bg-purple-500 rounded hover:bg-purple-600"
          >
            Share Time
          </button>
        </div>
      )}
    </div>
  );
}
