import React, { useState, useEffect } from "react";

const ROWS = 10;
const COLS = 10;
const BLOCK_SIZE = 25;
const FALL_INTERVAL = 60; // ms per step turun
const NEON_PURPLE = "#bb00ff";

const MONAD_BLOCKS = [
  { x: 0, y: 6 }, { x: 0, y: 7 }, { x: 0, y: 8 }, { x: 0, y: 9 },
  { x: 1, y: 6 }, { x: 2, y: 7 }, { x: 3, y: 6 }, { x: 3, y: 7 },
  { x: 3, y: 8 }, { x: 3, y: 9 },
  { x: 5, y: 6 }, { x: 5, y: 7 }, { x: 5, y: 8 }, { x: 5, y: 9 },
  { x: 6, y: 6 }, { x: 7, y: 6 }, { x: 7, y: 7 }, { x: 7, y: 8 },
  { x: 7, y: 9 }, { x: 6, y: 9 },
];

export default function TetrisMonadFlash() {
  const [blocks, setBlocks] = useState(
    MONAD_BLOCKS.map(({ x, y }) => ({ x, yCurrent: -1, yTarget: y }))
  );
  const [flash, setFlash] = useState(false);

  // jatuhin blok
  useEffect(() => {
    const interval = setInterval(() => {
      setBlocks((blocks) =>
        blocks.map((block) => {
          if (block.yCurrent < block.yTarget) {
            return { ...block, yCurrent: block.yCurrent + 1 };
          }
          return block;
        })
      );
    }, FALL_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  // toggle flash effect
  useEffect(() => {
    const flashInterval = setInterval(() => {
      setFlash((f) => !f);
    }, 400);

    return () => clearInterval(flashInterval);
  }, []);

  const grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));

  blocks.forEach(({ x, yCurrent }) => {
    if (x >= 0 && x < COLS && yCurrent >= 0 && yCurrent < ROWS) {
      grid[yCurrent][x] = NEON_PURPLE;
    }
  });

  return (
    <div
      style={{
        backgroundColor: "#000",
        padding: 20,
        display: "inline-block",
        borderRadius: 20,
        border: `4px solid ${flash ? "#ff33ff" : NEON_PURPLE}`,
        boxShadow: flash
          ? "0 0 40px 10px #ff33ff"
          : "0 0 30px 6px #bb00ff",
        transition: "border-color 0.3s ease, box-shadow 0.3s ease",
      }}
    >
      <div
        style={{
          width: COLS * BLOCK_SIZE,
          height: ROWS * BLOCK_SIZE,
          display: "grid",
          gridTemplateColumns: `repeat(${COLS}, ${BLOCK_SIZE}px)`,
          gridTemplateRows: `repeat(${ROWS}, ${BLOCK_SIZE}px)`,
          gap: 2,
          backgroundColor: "#111",
          borderRadius: 12,
          padding: 8,
        }}
      >
        {grid.flatMap((row, y) =>
          row.map((color, x) => (
            <div
              key={`${x}-${y}`}
              style={{
                width: BLOCK_SIZE,
                height: BLOCK_SIZE,
                backgroundColor: color || "#222",
                border: "1px solid #440088",
                boxShadow: color
                  ? `0 0 8px 2px ${flash ? "#ff33ff" : NEON_PURPLE}, inset 0 0 5px ${flash ? "#ff33ff" : NEON_PURPLE}`
                  : "none",
                borderRadius: 3,
                transition: "box-shadow 0.3s ease, background-color 0.3s ease",
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}
