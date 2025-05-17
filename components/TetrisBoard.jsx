import React, { useState, useEffect, useRef } from "react";

const ROWS = 20;
const COLS = 10;
const INTERVAL = 700;

const TETROMINOS = {
  I: {
    shape: [
      [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
      [[0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0]],
    ],
    color: "cyan",
  },
  O: {
    shape: [[[1, 1], [1, 1]]],
    color: "yellow",
  },
  T: {
    shape: [
      [[0, 1, 0], [1, 1, 1], [0, 0, 0]],
      [[0, 1, 0], [0, 1, 1], [0, 1, 0]],
      [[0, 0, 0], [1, 1, 1], [0, 1, 0]],
      [[0, 1, 0], [1, 1, 0], [0, 1, 0]],
    ],
    color: "purple",
  },
  S: {
    shape: [
      [[0, 1, 1], [1, 1, 0], [0, 0, 0]],
      [[0, 1, 0], [0, 1, 1], [0, 0, 1]],
    ],
    color: "green",
  },
  Z: {
    shape: [
      [[1, 1, 0], [0, 1, 1], [0, 0, 0]],
      [[0, 0, 1], [0, 1, 1], [0, 1, 0]],
    ],
    color: "red",
  },
  J: {
    shape: [
      [[1, 0, 0], [1, 1, 1], [0, 0, 0]],
      [[0, 1, 1], [0, 1, 0], [0, 1, 0]],
      [[0, 0, 0], [1, 1, 1], [0, 0, 1]],
      [[0, 1, 0], [0, 1, 0], [1, 1, 0]],
    ],
    color: "blue",
  },
  L: {
    shape: [
      [[0, 0, 1], [1, 1, 1], [0, 0, 0]],
      [[0, 1, 0], [0, 1, 0], [0, 1, 1]],
      [[0, 0, 0], [1, 1, 1], [1, 0, 0]],
      [[1, 1, 0], [0, 1, 0], [0, 1, 0]],
    ],
    color: "orange",
  },
};

const randomTetromino = () => {
  const keys = Object.keys(TETROMINOS);
  const rand = keys[Math.floor(Math.random() * keys.length)];
  return { ...TETROMINOS[rand], name: rand };
};

const emptyGrid = () => Array.from({ length: ROWS }, () => Array(COLS).fill(null));

export default function TetrisBoard() {
  const [grid, setGrid] = useState(emptyGrid());
  const [current, setCurrent] = useState({
    tetromino: randomTetromino(),
    rotation: 0,
    position: { x: 3, y: 0 },
  });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const intervalRef = useRef(null);

  const checkCollision = (x, y, rotation) => {
    const shape = current.tetromino.shape[rotation];
    for (let i = 0; i < shape.length; i++) {
      for (let j = 0; j < shape[i].length; j++) {
        if (shape[i][j]) {
          const newX = x + j;
          const newY = y + i;
          if (
            newX < 0 ||
            newX >= COLS ||
            newY >= ROWS ||
            (newY >= 0 && grid[newY][newX])
          ) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const placeTetromino = () => {
    const newGrid = grid.map((r) => [...r]);
    const shape = current.tetromino.shape[current.rotation];
    const { x, y } = current.position;
    shape.forEach((row, dy) => {
      row.forEach((val, dx) => {
        if (val && y + dy >= 0) {
          newGrid[y + dy][x + dx] = current.tetromino.color;
        }
      });
    });
    return newGrid;
  };

  const clearRows = (board) => {
    let cleared = 0;
    const filtered = board.filter((row) => {
      if (row.every((cell) => cell)) {
        cleared++;
        return false;
      }
      return true;
    });
    while (filtered.length < ROWS) {
      filtered.unshift(Array(COLS).fill(null));
    }
    if (cleared > 0) {
      setScore((s) => s + cleared * 100);
    }
    return filtered;
  };

  const tick = () => {
    const { x, y } = current.position;
    if (!checkCollision(x, y + 1, current.rotation)) {
      setCurrent((c) => ({ ...c, position: { x, y: y + 1 } }));
    } else {
      const newGrid = clearRows(placeTetromino());
      setGrid(newGrid);
      const next = randomTetromino();
      const start = { x: 3, y: 0 };
      if (checkCollision(start.x, start.y, 0)) {
        setGameOver(true);
        clearInterval(intervalRef.current);
      } else {
        setCurrent({ tetromino: next, rotation: 0, position: start });
      }
    }
  };

  // No keyboard controls for mobile only

  // Game loop interval
  useEffect(() => {
    if (!gameOver) {
      intervalRef.current = setInterval(tick, INTERVAL);
      return () => clearInterval(intervalRef.current);
    }
  }, [current, gameOver]);

  const renderGrid = () => {
    const displayGrid = grid.map((r) => [...r]);
    const shape = current.tetromino.shape[current.rotation];
    const { x, y } = current.position;

    shape.forEach((row, dy) => {
      row.forEach((val, dx) => {
        if (
          val &&
          y + dy >= 0 &&
          y + dy < ROWS &&
          x + dx >= 0 &&
          x + dx < COLS
        ) {
          displayGrid[y + dy][x + dx] = current.tetromino.color;
        }
      });
    });

    return displayGrid;
  };

  // Handle button controls
  const handleControl = (action) => {
    if (gameOver) return;
    const { x, y } = current.position;
    let rot = current.rotation;

    switch (action) {
      case "left":
        if (!checkCollision(x - 1, y, rot))
          setCurrent((c) => ({ ...c, position: { x: x - 1, y } }));
        break;
      case "right":
        if (!checkCollision(x + 1, y, rot))
          setCurrent((c) => ({ ...c, position: { x: x + 1, y } }));
        break;
      case "down":
        if (!checkCollision(x, y + 1, rot))
          setCurrent((c) => ({ ...c, position: { x, y: y + 1 } }));
        break;
      case "rotate":
        const nextRot = (rot + 1) % current.tetromino.shape.length;
        if (!checkCollision(x, y, nextRot)) setCurrent((c) => ({ ...c, rotation: nextRot }));
        break;
      case "hardDrop":
        let dropY = y;
        while (!checkCollision(x, dropY + 1, rot)) {
          dropY++;
        }
        setCurrent((c) => ({ ...c, position: { x, y: dropY } }));
        break;
      default:
        break;
    }
  };

  return (
    <div className="flex flex-col items-center bg-gray-900 min-h-screen p-4 text-white select-none relative">
      <div className="text-3xl font-bold tracking-widest mb-4">TETRIS</div>

      <div className="bg-gray-800 p-2 rounded-md grid grid-cols-10 gap-0.5">
        {renderGrid().map((row, y) =>
          row.map((cell, x) => (
            <div
              key={`${y}-${x}`}
              className="w-6 h-6 border border-gray-700"
              style={{ backgroundColor: cell || "transparent" }}
            />
          ))
        )}
      </div>

      <div className="mt-4 text-lg">Score: {score}</div>

      {/* Retro gamepad fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-800 p-4 flex justify-center gap-4 max-w-md mx-auto shadow-inner z-50">
        <button
          onClick={() => handleControl("left")}
          className="bg-gray-700 px-5 py-2 rounded-md shadow-md hover:bg-gray-600 active:scale-95 transition-transform font-mono text-2xl"
          aria-label="Move Left"
        >
          ◀
        </button>
        <button
          onClick={() => handleControl("rotate")}
          className="bg-gray-700 px-5 py-2 rounded-md shadow-md hover:bg-gray-600 active:scale-95 transition-transform font-mono text-2xl"
          aria-label="Rotate"
        >
          ↻
        </button>
        <button
          onClick={() => handleControl("right")}
          className="bg-gray-700 px-5 py-2 rounded-md shadow-md hover:bg-gray-600 active:scale-95 transition-transform font-mono text-2xl"
          aria-label="Move Right"
        >
          ▶
        </button>
        <button
          onClick={() => handleControl("down")}
          className="bg-gray-700 px-5 py-2 rounded-md shadow-md hover:bg-gray-600 active:scale-95 transition-transform font-mono text-2xl"
          aria-label="Move Down"
        >
          ▼
        </button>
        <button
          onClick={() => handleControl("hardDrop")}
          className="bg-red-600 px-5 py-2 rounded-md shadow-md hover:bg-red-500 active:scale-95 transition-transform font-mono text-2xl text-white"
          aria-label="Hard Drop"
        >
          DROP
        </button>
      </div>

      {gameOver && (
        <div className="mt-6 text-2xl text-red-500 font-bold">GAME OVER</div>
      )}
    </div>
  );
}
