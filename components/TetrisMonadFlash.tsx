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

// Fungsi untuk nge-center blok dalam kotak 5x5
function centerBlocks(blocks: LetterBlocks): LetterBlocks {
  const xs = blocks.map(b => b.x);
  const ys = blocks.map(b => b.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const width = maxX - minX;
  const height = maxY - minY;

  // Offset supaya huruf centered di posisi (2,2)
  const offsetX = 2 - (minX + width / 2);
  const offsetY = 2 - (minY + height / 2);

  return blocks.map(({ x, y }) => ({
    x: x + offsetX,
    y: y + offsetY,
  }));
}

export default function TetrisMonadFlash({
  word = "MON",
  boxSize = 14,
  spacing = 1,
  maxFallOffset = 18,
  fallSpeed = 40,
}: TetrisMonadFlashProps) {
  const [fallOffsets, setFallOffsets] = useState<number[]>([]);

  // Hitung letter patterns yang sudah di-center
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
            {blocks.map((block) => {
              const fallOffset = fallOffsets[blockIndex] || 0;
              const top = (block.y + fallOffset) * (boxSize + spacing);
              const left = block.x * (boxSize + spacing);
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
