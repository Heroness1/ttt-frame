import React, { useState, useEffect, useRef } from "react";

const ROWS = 20;
const COLS = 10;
const INTERVAL_START = 700;

// Bentuk Tetromino dan warna
const TETROMINOS = {
  I: {
    shape: [
      [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
      [[0,0,1,0],[0,0,1,0],[0,0,1,0],[0,0,1,0]],
    ],
    color: "cyan"
  },
  O: {
    shape: [
      [[1,1],[1,1]],
    ],
    color: "yellow"
  },
  T: {
    shape: [
      [[0,1,0],[1,1,1],[0,0,0]],
      [[0,1,0],[0,1,1],[0,1,0]],
      [[0,0,0],[1,1,1],[0,1,0]],
      [[0,1,0],[1,1,0],[0,1,0]],
    ],
    color: "purple"
  },
  S: {
    shape: [
      [[0,1,1],[1,1,0],[0,0,0]],
      [[0,1,0],[0,1,1],[0,0,1]],
    ],
    color: "green"
  },
  Z: {
    shape: [
      [[1,1,0],[0,1,1],[0,0,0]],
      [[0,0,1],[0,1,1],[0,1,0]],
    ],
    color: "red"
  },
  J: {
    shape: [
      [[1,0,0],[1,1,1],[0,0,0]],
      [[0,1,1],[0,1,0],[0,1,0]],
      [[0,0,0],[1,1,1],[0,0,1]],
      [[0,1,0],[0,1,0],[1,1,0]],
    ],
    color: "blue"
  },
  L: {
    shape: [
      [[0,0,1],[1,1,1],[0,0,0]],
      [[0,1,0],[0,1,0],[0,1,1]],
      [[0,0,0],[1,1,1],[1,0,0]],
      [[1,1,0],[0,1,0],[0,1,0]],
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
  const [intervalSpeed, setIntervalSpeed] = useState(INTERVAL_START);

  const intervalRef = useRef(null);

  const checkCollision = (posX, posY, rotation) => {
    const shape = current.tetromino.shape[rotation];
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const newX = posX + x;
          const newY = posY + y;
          if (
            newX < 0 || newX >= COLS || newY >= ROWS ||
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
    const newGrid = grid.map(row => row.slice());
    const shape = current.tetromino.shape[current.rotation];
    const { x: posX, y: posY } = current.position;
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const gridY = posY + y;
          const gridX = posX + x;
          if(gridY >= 0) newGrid[gridY][gridX] = current.tetromino.color;
        }
      }
    }
    return newGrid;
  };

  const clearRows = (board) => {
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
    if (cleared > 0) {
      setScore(prev => prev + cleared * 100);
      // Optional: Speed up game slightly
      setIntervalSpeed(prev => Math.max(100, prev - cleared * 20));
    }
    return newBoard;
  };

  const tick = () => {
    if (gameOver) return;
    const { x, y } = current.position;
    if (!checkCollision(x, y + 1, current.rotation)) {
      setCurrent(c => ({ ...c, position: { x, y: y + 1 } }));
    } else {
      const newGrid = placeTetromino();
      const clearedGrid = clearRows(newGrid);
      setGrid(clearedGrid);

      const next = randomTetromino();
      const startPos = { x: 3, y: 0 };
      if (checkCollision(startPos.x, startPos.y, 0)) {
        setGameOver(true);
        clearInterval(intervalRef.current);
      } else {
        setCurrent({ tetromino: next, rotation: 0, position: startPos });
      }
    }
  };

  useEffect(() => {
    const handleKey = (e) => {
      if (gameOver) return;
      const { x, y } = current.position;
      const rotation = current.rotation;
      switch (e.key) {
        case "ArrowLeft":
          if (!checkCollision(x - 1, y, rotation))
            setCurrent(c => ({ ...c, position: { x: x - 1, y } }));
          break;
        case "ArrowRight":
          if (!checkCollision(x + 1, y, rotation))
            setCurrent(c => ({ ...c, position: { x: x + 1, y } }));
          break;
        case "ArrowDown":
          if (!checkCollision(x, y + 1, rotation))
            setCurrent(c => ({ ...c, position: { x, y: y + 1 } }));
          break;
        case "ArrowUp":
          const newRotation = (rotation + 1) % current.tetromino.shape.length;
          if (!checkCollision(x, y, newRotation))
            setCurrent(c => ({ ...c, rotation: newRotation }));
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [current, gameOver]);

  useEffect(() => {
    if (gameOver) return;
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(tick, intervalSpeed);
    return () => clearInterval(intervalRef.current);
  }, [tick, intervalSpeed, gameOver]);

  // Render the game grid including active tetromino overlay
  const renderGrid = () => {
    const displayGrid = grid.map(row => row.slice());
    const shape = current.tetromino.shape[current.rotation];
    const { x: posX, y: posY } = current.position;
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const gridY = posY + y;
          const gridX = posX + x;
          if (gridY >= 0 && gridY < ROWS && gridX >= 0 && gridX < COLS) {
            displayGrid[gridY][gridX] = current.tetromino.color;
          }
        }
      }
    }

    return displayGrid.map((row, y) => (
      <div key={y} style={{ display: "flex" }}>
        {row.map((cell, x) => (
          <div
            key={x}
            style={{
              width: 30,
              height: 30,
              border: "1px solid #222",
              backgroundColor: cell ? cell : "transparent"
            }}
          />
        ))}
      </div>
    ));
  };

  return (
    <div style={{ userSelect: "none", color: "white", fontFamily: "sans-serif" }}>
      <h2>Tetris Game</h2>
      <div style={{ width: COLS * 30, margin: "auto", backgroundColor: "#111", border: "2px solid #333" }}>
        {renderGrid()}
      </div>
      <div style={{ marginTop: 10 }}>
        <div>Score: {score}</div>
        {gameOver && <div style={{ color: "red", marginTop: 10 }}>Game Over!</div>}
        <button
          onClick={() => {
            setGrid(emptyGrid());
            setCurrent({
              tetromino: randomTetromino(),
              rotation: 0,
              position: { x: 3, y: 0 }
            });
            setScore(0);
            setGameOver(false);
            setIntervalSpeed(INTERVAL_START);
          }}
          style={{ marginTop: 10, padding: "6px 12px", cursor: "pointer" }}
        >
          Restart
        </button>
      </div>
    </div>
  );
}
