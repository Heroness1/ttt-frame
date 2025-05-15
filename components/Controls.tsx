import React from "react";

type ControlsProps = {
  onLeft: () => void;
  onRight: () => void;
  onShoot: () => void;
};

export default function Controls({ onLeft, onRight, onShoot }: ControlsProps) {
  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
      <button
        onClick={onLeft}
        className="bg-purple-600 px-4 py-2 rounded hover:bg-purple-700"
      >
        Left
      </button>
      <button
        onClick={onShoot}
        className="bg-purple-600 px-4 py-2 rounded hover:bg-purple-700"
      >
        Shoot
      </button>
      <button
        onClick={onRight}
        className="bg-purple-600 px-4 py-2 rounded hover:bg-purple-700"
      >
        Right
      </button>
    </div>
  );
}
