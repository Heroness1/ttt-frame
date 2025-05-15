import React from "react";

type PlayerProps = { x: number; y: number };

export default function Player({ x, y }: PlayerProps) {
  return (
    <img
      src="/images/player-sprites.png"
      alt="Player"
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 48,
        height: 48,
        imageRendering: "pixelated",
      }}
    />
  );
}
