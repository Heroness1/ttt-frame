import React from "react";

type ZombieProps = { x: number; y: number };

export default function Zombie({ x, y }: ZombieProps) {
  return (
    <img
      src="/images/zombie-sprites.png"
      alt="Zombie"
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
