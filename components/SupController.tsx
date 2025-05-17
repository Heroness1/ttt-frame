"use client";

import React from "react";

interface SupControllerProps {
  onButtonPress?: (button: string) => void;
}

const SupController: React.FC<SupControllerProps> = ({ onButtonPress }) => {
  const handlePress = (button: string) => {
    if (onButtonPress) onButtonPress(button);
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4 select-none">
      {/* Tombol Back */}
      <button
        onClick={() => handlePress("back")}
        className="w-16 h-8 rounded bg-gray-700 text-white text-xs"
      >
        Back
      </button>

      {/* Area kontrol utama */}
      <div className="flex items-center justify-center gap-12">
        {/* D-Pad */}
        <div className="grid grid-cols-3 grid-rows-3 gap-1 w-24 h-24">
          <div />
          <button
            onClick={() => handlePress("up")}
            className="w-full h-full bg-gray-800 rounded"
          />
          <div />

          <button
            onClick={() => handlePress("left")}
            className="w-full h-full bg-gray-800 rounded"
          />
          <div />
          <button
            onClick={() => handlePress("right")}
            className="w-full h-full bg-gray-800 rounded"
          />

          <div />
          <button
            onClick={() => handlePress("down")}
            className="w-full h-full bg-gray-800 rounded"
          />
          <div />
        </div>

        {/* Tombol A/B */}
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={() => handlePress("A")}
            className="w-12 h-12 rounded-full bg-gray-800 text-white font-bold"
          >
            A
          </button>
          <button
            onClick={() => handlePress("B")}
            className="w-12 h-12 rounded-full bg-gray-800 text-white font-bold"
          >
            B
          </button>
        </div>
      </div>
    </div>
  );
};

export default SupController;
