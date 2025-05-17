"use client";

import React, { useState, useEffect, useRef } from "react";
import SupController from "./SupController";

const ROWS = 20;
const COLS = 10;
const INTERVAL = 700;

const TETROMINOS = {
  I: {
    shape: [
      [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
      [[0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0]],
    ],
    color: "cyan"
  },
  O: {
    shape: [[[1, 1], [1, 1]]],
    color: "yellow"
  },
  T: {
    shape: [
      [[0, 1, 0], [1, 1, 1], [0, 0, 0]],
      [[0, 1, 0], [0, 1, 1], [0, 1, 0]],
      [[0, 0, 0], [1, 1, 1], [0, 1, 0]],
      [[0, 1, 0], [1, 1, 0], [0, 1, 0]],
    ],
    color: "purple"
  },
  S: {
    shape: [
      [[0, 1, 1], [1, 1, 0], [0, 0, 0]],
      [[0, 1, 0], [0, 1, 1], [0, 0, 1]],
    ],
    color: "green"
  },
  Z: {
    shape: [
      [[1, 1, 0], [0, 1, 1], [0, 0, 0]],
      [[0, 0, 1], [0, 1, 1], [0, 1, 0]],
    ],
    color: "red"
  },
  J: {
    shape: [
      [[1, 0, 0], [1, 1, 1], [0, 0, 0]],
      [[0, 1, 1], [0, 1, 0], [0, 1, 0]],
      [[0, 0, 0], [1, 1, 1], [0, 0, 1]],
      [[0, 1, 0], [0, 1, 0], [1, 1, 0]],
    ],
    color: "blue"
  },
  L: {
    shape: [
      [[0, 0, 1], [1, 1, 1], [0, 0, 0]],
      [[0, 1, 0], [0, 1, 0], [0, 1, 1]],
      [[0, 0, 0], [1, 1, 1], [1, 0, 0]],
      [[1, 1, 0], [0, 1, 0], [0, 1, 0]],
    ],
    color: "orange"
  }
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
    position: { x: 3, y: 0 }
  });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timer | null>(null);

  const checkCollision = (x: number, y: number, rotation: number) => {
    const shape = current.tetromino.shape[rotation];
    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col]) {
          const newX = x + col;
          const newY = y + row;
          if (
            newX < 0 || newX >= COLS || newY >= ROWS ||
            (newY >= 0 && grid[newY][newX])
          ) return true;
        }
      }
    }
    return false;
  };

  const placeTetromino = () => {
    const newGrid = grid.map(row => [...row]);
    const shape = current.tetromino.shape[current.rotation];
    const { x, y } = current.position;
    shape.forEach((row, dy) => {
      row.forEach((cell, dx) => {
        if (cell) {
          const newY = y + dy;
          const newX = x + dx;
          if (newY >= 0) newGrid[newY][newX] = current.tetromino.color;
        }
      });
    });
    return newGrid;
  };

  const clearRows = (board: string[][]) => {
    let cleared = 0;
    const newBoard = board.filter(row => {
      if (row.every(cell => cell !== null)) {
        cleared++;
        return false;
      }
      return true;
    });
    while (newBoard.length < ROWS) {
      newBoard.unshift(Array(COLS).fill(null));
    }
    if (cleared > 0) setScore(prev => prev + cleared * 100);
    return newBoard;
  };

  const tick = () => {
    if (gameOver || isPaused) return;
    const { x, y } = current.position;
    if (!checkCollision(x, y + 1, current.rotation)) {
      setCurrent(c => ({ ...c, position: { x, y: y + 1 } }));
    } else {
      const newGrid = placeTetromino();
      const cleared = clearRows(newGrid);
      setGrid(cleared);
      const next = randomTetromino();
      const startPos = { x: 3, y: 0 };
      if (checkCollision(startPos.x, startPos.y, 0)) {
        setGameOver(true);
        clearInterval(intervalRef.current!);
      } else {
        setCurrent({ tetromino: next, rotation: 0, position: startPos });
      }
    }
  };

  useEffect(() => {
    if (gameOver || isPaused) return;
    intervalRef.current = setInterval(tick, INTERVAL);
    return () => clearInterval(intervalRef.current!);
  }, [current, gameOver, isPaused]);

  const hardDrop = () => {
    let { x, y } = current.position;
    while (!checkCollision(x, y + 1, current.rotation)) {
      y++;
    }
    setCurrent(c => ({ ...c, position: { x, y } }));
  };

  const resetGame = () => {
    setGrid(emptyGrid());
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
    setCurrent({
      tetromino: randomTetromino(),
      rotation: 0,
      position: { x: 3, y: 0 }
    });
  };

  const handleControl = (button: string) => {
    if (gameOver && button !== "back") return;

    const { x, y } = current.position;
    const rotation = current.rotation;

    switch (button) {
      case "left":
        if (!checkCollision(x - 1, y, rotation))
          setCurrent(c => ({ ...c, position: { x: x - 1, y } }));
        break;
      case "right":
        if (!checkCollision(x + 1, y, rotation))
          setCurrent(c => ({ ...c, position: { x: x + 1, y } }));
        break;
      case "down":
        if (!checkCollision(x, y + 1, rotation))
          setCurrent(c => ({ ...c, position: { x, y: y + 1 } }));
        break;
      case "rotate":
        const nextRotation = (rotation + 1) % current.tetromino.shape.length;
        if (!checkCollision(x, y, nextRotation))
          setCurrent(c => ({ ...c, rotation: nextRotation }));
        break;
      case "A":
      case "up":
        setIsPaused(p => !p);
        break;
      case "B":
        hardDrop();
        break;
      case "back":
        resetGame();
        break;
    }
  };

  const renderGrid = () => {
    const display = grid.map(row => [...row]);
    const shape = current.tetromino.shape[current.rotation];
    const { x, y } = current.position;
    shape.forEach((row, dy) => {
      row.forEach((cell, dx) => {
        if (cell) {
          const newY = y + dy;
          const newX = x + dx;
          if (newY >= 0 && newY < ROWS && newX >= 0 && newX < COLS) {
            display[newY][newX] = current.tetromino.color;
          }
        }
      });
    });
    return display.map((row, yIdx) => (
      <div key={yIdx} style={{ display: "flex" }}>
        {row.map((cell, xIdx) => (
          <div
            key={xIdx}
            style={{
              width: 24,
              height: 24,
              backgroundColor: cell || "#222",
              border: "1px solid #333",
            }}
          />
        ))}
      </div>
    ));
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <h2 className="text-xl font-bold mb-4">
        {gameOver ? "GAME OVER" : isPaused ? "PAUSED" : `Score: ${score}`}
      </h2>

      <div
        style={{
          backgroundColor: "#000",
          border: "4px solid cyan",
          padding: 10,
          borderRadius: 8,
        }}
      >
        {renderGrid()}
      </div>

      <SupController onButtonPress={handleControl} />
    </div>
  );
}
