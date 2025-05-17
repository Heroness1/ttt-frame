import React, { useState, useEffect, useRef } from "react";
import "./TetrisBoard.css";

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
            newX < 0 || newX >= COLS ||
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
    const newGrid = grid.map(r => [...r]);
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
    const filtered = board.filter(row => {
      if (row.every(cell => cell)) {
        cleared++;
        return false;
      }
      return true;
    });
    while (filtered.length < ROWS) {
      filtered.unshift(Array(COLS).fill(null));
    }
    if (cleared > 0) {
      setScore(s => s + cleared * 100);
    }
    return filtered;
  };

  const tick = () => {
    const { x, y } = current.position;
    if (!checkCollision(x, y + 1, current.rotation)) {
      setCurrent(c => ({ ...c, position: { x, y: y + 1 } }));
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

  useEffect(() => {
    const handleKey = (e) => {
      if (gameOver) return;
      const { x, y } = current.position;
      let rot = current.rotation;
      switch (e.key) {
        case "ArrowLeft":
          if (!checkCollision(x - 1, y, rot))
            setCurrent(c => ({ ...c, position: { x: x - 1, y } }));
          break;
        case "ArrowRight":
          if (!checkCollision(x + 1, y, rot))
            setCurrent(c => ({ ...c, position: { x: x + 1, y } }));
          break;
        case "ArrowDown":
          if (!checkCollision(x, y + 1, rot))
            setCurrent(c => ({ ...c, position: { x, y: y + 1 } }));
          break;
        case "ArrowUp":
          const nextRot = (rot + 1) % current.tetromino.shape.length;
          if (!checkCollision(x, y, nextRot))
            setCurrent(c => ({ ...c, rotation: nextRot }));
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [current, gameOver]);

  useEffect(() => {
    if (!gameOver) {
      intervalRef.current = setInterval(tick, INTERVAL);
      return () => clearInterval(intervalRef.current);
    }
  }, [current, gameOver]);

  const renderGrid = () => {
    const displayGrid = grid.map(r => [...r]);
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

  return (
    <div>
      <div className="tetris-grid">
        {renderGrid().map((row, y) => (
          <div key={y} className="tetris-row">
            {row.map((cell, x) => (
              <div
                key={x}
                className="tetris-cell"
                style={{ backgroundColor: cell || "black" }}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="tetris-score">Score: {score}</div>
      {gameOver && <div className="tetris-game-over">Game Over</div>}
    </div>
  );
}
