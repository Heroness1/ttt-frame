import React, { useState, useEffect, useRef } from "react";
import SupController from "./SupController";

type TetrominoKey = "I" | "O" | "T" | "S" | "Z" | "J" | "L";

interface Tetromino {
  shape: number[][][];
  color: string;
}

const ROWS = 20;
const COLS = 10;

const TETROMINOS: Record<TetrominoKey, Tetromino> = {
  I: {
    shape: [
      [[1, 1, 1, 1]],
      [[1], [1], [1], [1]],
    ],
    color: "cyan",
  },
  O: {
    shape: [
      [[1, 1], [1, 1]],
    ],
    color: "yellow",
  },
  T: {
    shape: [
      [[0, 1, 0], [1, 1, 1]],
      [[1, 0], [1, 1], [1, 0]],
      [[1, 1, 1], [0, 1, 0]],
      [[0, 1], [1, 1], [0, 1]],
    ],
    color: "purple",
  },
  S: {
    shape: [
      [[0, 1, 1], [1, 1, 0]],
      [[1, 0], [1, 1], [0, 1]],
    ],
    color: "green",
  },
  Z: {
    shape: [
      [[1, 1, 0], [0, 1, 1]],
      [[0, 1], [1, 1], [1, 0]],
    ],
    color: "red",
  },
  J: {
    shape: [
      [[1, 0, 0], [1, 1, 1]],
      [[1, 1], [1, 0], [1, 0]],
      [[1, 1, 1], [0, 0, 1]],
      [[0, 1], [0, 1], [1, 1]],
    ],
    color: "blue",
  },
  L: {
    shape: [
      [[0, 0, 1], [1, 1, 1]],
      [[1, 0], [1, 0], [1, 1]],
      [[1, 1, 1], [1, 0, 0]],
      [[1, 1], [0, 1], [0, 1]],
    ],
    color: "orange",
  },
};

interface CurrentTetromino {
  name: TetrominoKey;
  position: { x: number; y: number };
  rotation: number;
  tetromino: Tetromino;
}

const emptyGrid = () => Array.from({ length: ROWS }, () => Array(COLS).fill(null));

const randomTetromino = (): CurrentTetromino => {
  const keys = Object.keys(TETROMINOS) as TetrominoKey[];
  const rand = keys[Math.floor(Math.random() * keys.length)];
  return {
    name: rand,
    position: { x: Math.floor(COLS / 2) - 1, y: 0 },
    rotation: 0,
    tetromino: TETROMINOS[rand],
  };
};

const TetrisBoard: React.FC = () => {
  const [grid, setGrid] = useState<(string | null)[][]>(emptyGrid());
  const [current, setCurrent] = useState<CurrentTetromino>(randomTetromino());
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cek collision ketika pindah posisi atau rotate
  const checkCollision = (x: number, y: number, rotation: number) => {
    const shape = current.tetromino.shape[rotation];
    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col]) {
          const newX = x + col;
          const newY = y + row;
          if (
            newX < 0 ||
            newX >= COLS ||
            newY >= ROWS ||
            (newY >= 0 && grid[newY][newX] !== null)
          ) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const moveDown = () => {
    if (!checkCollision(current.position.x, current.position.y + 1, current.rotation)) {
      setCurrent((prev) => ({
        ...prev,
        position: { x: prev.position.x, y: prev.position.y + 1 },
      }));
    } else {
      // Lock tetromino on grid
      const shape = current.tetromino.shape[current.rotation];
      setGrid((prevGrid) => {
        const newGrid = prevGrid.map((row) => [...row]);
        for (let row = 0; row < shape.length; row++) {
          for (let col = 0; col < shape[row].length; col++) {
            if (shape[row][col]) {
              const x = current.position.x + col;
              const y = current.position.y + row;
              if (y >= 0) newGrid[y][x] = current.name;
            }
          }
        }
        return newGrid;
      });
      // Reset current tetromino
      setCurrent(randomTetromino());
    }
  };

  // Start game loop
  useEffect(() => {
    if (!isPaused) {
      intervalRef.current = setInterval(() => {
        moveDown();
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [current, isPaused]);

  const handleButtonPress = (button: string) => {
    if (isPaused) return;

    switch (button) {
      case "left":
        if (!checkCollision(current.position.x - 1, current.position.y, current.rotation)) {
          setCurrent((prev) => ({
            ...prev,
            position: { x: prev.position.x - 1, y: prev.position.y },
          }));
        }
        break;
      case "right":
        if (!checkCollision(current.position.x + 1, current.position.y, current.rotation)) {
          setCurrent((prev) => ({
            ...prev,
            position: { x: prev.position.x + 1, y: prev.position.y },
          }));
        }
        break;
      case "down":
        moveDown();
        break;
      case "up": // rotate
        const newRotation = (current.rotation + 1) % current.tetromino.shape.length;
        if (!checkCollision(current.position.x, current.position.y, newRotation)) {
          setCurrent((prev) => ({ ...prev, rotation: newRotation }));
        }
        break;
      case "A":
        // Bisa untuk hard drop atau fungsi lain
        break;
      case "B":
        setIsPaused((p) => !p);
        break;
      case "back":
        // Fungsi kembali ke menu, implementasi terserah
        break;
    }
  };

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${COLS}, 20px)`,
          gridTemplateRows: `repeat(${ROWS}, 20px)`,
          gap: "1px",
          backgroundColor: "#222",
        }}
      >
        {grid.map((row, y) =>
          row.map((cell, x) => {
            // Cek apakah ada bagian tetromino current di sini juga
            let color = cell ? TETROMINOS[cell as TetrominoKey].color : "black";

            // Check current tetromino overlay
            const shape = current.tetromino.shape[current.rotation];
            const relativeX = x - current.position.x;
            const relativeY = y - current.position.y;
            if (
              relativeX >= 0 &&
              relativeX < shape[0].length &&
              relativeY >= 0 &&
              relativeY < shape.length &&
              shape[relativeY][relativeX]
            ) {
              color = current.tetromino.color;
            }

            return (
              <div
                key={`${x}-${y}`}
                style={{
                  width: 20,
                  height: 20,
                  backgroundColor: color,
                  border: "1px solid #444",
                }}
              />
            );
          })
        )}
      </div>
      <SupController onButtonPress={handleButtonPress} />
      <div>
        {isPaused ? "Paused" : "Playing"}
      </div>
    </div>
  );
};

export default TetrisBoard;
