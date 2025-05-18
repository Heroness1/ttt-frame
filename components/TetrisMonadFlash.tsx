"use client";

import React, { useEffect, useState, useMemo } from "react";

type Block = { x: number; y: number };
type LetterBlocks = Block[];

const letterPatterns: { [char: string]: LetterBlocks } = {
  M: [
    { x:0, y:0 }, { x:0, y:1 }, { x:0, y:2 }, { x:0, y:3 }, { x:0, y:4 },
    { x:1, y:1 }, { x:2, y:2 }, { x:3, y:1 },
    { x:4, y:0 }, { x:4, y:1 }, { x:4, y:2 }, { x:4, y:3 }, { x:4, y:4 },
  ],
  O: [
    { x:0, y:1 }, { x:0, y:2 }, { x:0, y:3 },
    { x:1, y:0 }, { x:1, y:4 },
    { x:2, y:0 }, { x:2, y:4 },
    { x:3, y:0 }, { x:3, y:4 },
    { x:4, y:1 }, { x:4, y:2 }, { x:4, y:3 },
  ],
  N: [
    { x:0, y:0 }, { x:0, y:1 }, { x:0, y:2 }, { x:0, y:3 }, { x:0, y:4 },
    { x:1, y:1 },
    { x:2, y:2 },
    { x:3, y:3 },
    { x:4, y:0 }, { x:4, y:1 }, { x:4, y:2 }, { x:4, y:3 }, { x:4, y:4 },
  ],
};

interface TetrisMonadFlashProps {
  word?: string;
  boxSize?: number;
  spacing?: number;
  maxFallOffset?: number;
  fallSpeed?: number;
}

// Fungsi untuk center block dalam 5x5 grid
function centerBlocks(blocks: LetterBlocks): LetterBlocks {
  const minX = 0;
  const maxX = 4; // grid 5x5
  const minY = 0;
  const maxY = 4;

  const centerX = (minX + maxX) / 2; // 2
  const centerY = (minY + maxY) / 2; // 2

  return blocks.map(({ x, y }) => ({
    x: x - centerX,
    y: y - centerY,
  }));
}

export default function TetrisMonadFlash({
  word = "MONAD",
  boxSize = 14,
  spacing = 1,
  maxFallOffset = 18,
  fallSpeed = 40,
}: TetrisMonadFlashProps) {
  const [fallOffsets, setFallOffsets] = useState<number[]>([]);

  // Membuat letterPatterns yang sudah di-center tiap huruf
  const centeredLetterPatterns = useMemo(() => {
    const result: { [char: string]: LetterBlocks } = {};
    for (const char in letterPatterns) {
      result[char] = centerBlocks(letterPatterns[char]);
    }
    return result;
  }, []);

  useEffect(() => {
    const totalBlocks = word
      .split("")
      .reduce((acc, char) => acc + (centeredLetterPatterns[char]?.length || 0), 0);
    const initialOffsets = Array(totalBlocks)
      .fill(0)
      .map(() => Math.floor(Math.random() * maxFallOffset));
    setFallOffsets(initialOffsets);

    const interval = setInterval(() => {
      setFallOffsets((prev) =>
        prev.map((offset) => Math.max(0, offset - 1))
      );
    }, fallSpeed);

    return () => clearInterval(interval);
  }, [word, maxFallOffset, fallSpeed, centeredLetterPatterns]);

  let blockIndex = 0;

  return (
    <div style={{ display: "flex", gap: `${spacing * boxSize}px`, justifyContent: "center" }}>
      <style jsx>{`
        .flash {
          animation: flash 1.4s infinite alternate;
        }

        @keyframes flash {
          0% {
            box-shadow:
              0 0 4px #bb00ff,
              0 0 8px #bb00ff,
              0 0 16px #ff77ff;
            background-color: #a020f0;
          }
          100% {
            box-shadow:
              0 0 1px #7700aa,
              0 0 2px #7700aa,
              0 0 4px #aa00dd;
            background-color: #6600aa;
          }
        }
      `}</style>
      {word.split("").map((char, letterIndex) => {
        const blocks = centeredLetterPatterns[char] || [];
        return (
          <div
            key={letterIndex}
            style={{
              position: "relative",
              width: 5 * (boxSize + spacing),
              height: 5 * (boxSize + spacing),
            }}
          >
            {blocks.map((block, i) => {
              const fallOffset = fallOffsets[blockIndex] || 0;
              const top =
                (block.y + 2 + fallOffset) * (boxSize + spacing);
              const left = (block.x + 2) * (boxSize + spacing);
              const id = blockIndex;
              blockIndex++;
              return (
                <div
                  key={id}
                  className="flash"
                  style={{
                    position: "absolute",
                    top,
                    left,
                    width: boxSize,
                    height: boxSize,
                    transition: `top ${fallSpeed}ms ease-out`,
                    borderRadius: 2,
                  }}
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
