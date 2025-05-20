import React, { useState, useEffect, useRef } from "react";
import {
  checkCollision,
  placeTetromino,
  clearRows,
} from "./gridUtils";
import { runExplosions } from "./utils/explosionUtils";
import "./explode.css";

const ROWS = 14;
const COLS = 10;
const INTERVAL = 700;

const TETROMINOS = {
  I: {
    shape: [
      [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
      [
        [0, 0, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 1, 0],
      ],
    ],
    color: "cyan",
  },
  O: { shape: [[[1, 1], [1, 1]]], color: "yellow" },
  T: {
    shape: [
      [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0],
      ],
      [
        [0, 1, 0],
        [0, 1, 1],
        [0, 1, 0],
      ],
      [
        [0, 0, 0],
        [1, 1, 1],
        [0, 1, 0],
      ],
      [
        [0, 1, 0],
        [1, 1, 0],
        [0, 1, 0],
      ],
    ],
    color: "purple",
  },
  S: {
    shape: [
      [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0],
      ],
      [
        [0, 1, 0],
        [0, 1, 1],
        [0, 0, 1],
      ],
    ],
    color: "green",
  },
  Z: {
    shape: [
      [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0],
      ],
      [
        [0, 0, 1],
        [0, 1, 1],
        [0, 1, 0],
      ],
    ],
    color: "red",
  },
  J: {
    shape: [
      [
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 0],
      ],
      [
        [0, 1, 1],
        [0, 1, 0],
        [0, 1, 0],
      ],
      [
        [0, 0, 0],
        [1, 1, 1],
        [0, 0, 1],
      ],
      [
        [0, 1, 0],
        [0, 1, 0],
        [1, 1, 0],
      ],
    ],
    color: "blue",
  },
  L: {
    shape: [
      [
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0],
      ],
      [
        [0, 1, 0],
        [0, 1, 0],
        [0, 1, 1],
      ],
      [
        [0, 0, 0],
        [1, 1, 1],
        [1, 0, 0],
      ],
      [
        [1, 1, 0],
        [0, 1, 0],
        [0, 1, 0],
      ],
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
    position: { x: 2, y: -1 },
  });
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const intervalRef = useRef(null);

  // Ambil highScore dari localStorage hanya di client side
  useEffect(() => {
    const saved = localStorage.getItem("tetris-high-score");
    if (saved) setHighScore(parseInt(saved));
  }, []);

  // Simpan highScore ke localStorage saat berubah
  useEffect(() => {
    if (highScore > 0) {
      localStorage.setItem("tetris-high-score", highScore.toString());
    }
  }, [highScore]);

  const checkCollision = (x, y, rotation) => {
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
            (newY >= 0 && grid[newY][newX])
          )
            return true;
        }
      }
    }
    return false;
  };

  const placeTetromino = () => {
    const newGrid = grid.map((row) => [...row]);
    const shape = current.tetromino.shape[current.rotation];
    const { x, y } = current.position;
    shape.forEach((row, dy) => {
      row.forEach((cell, dx) => {
        if (cell) {
          const newY = y + dy;
          const newX = x + dx;
          if (newY >= 0) newGrid[newY][newX] = { color: tetromino.color, exploded: false };
        }
      });
    });
    return newGrid;
  };

  const clearRows = (board) => {
    let cleared = 0;
    const newBoard = board.filter((row) => {
      if (row.every((cell) => cell !== null)) {
        cleared++;
        return false;
      }
      return true;
    });
    while (newBoard.length < ROWS) {
      newBoard.unshift(Array(COLS).fill(null));
    }
    if (cleared > 0) {
      setScore((prev) => {
        const newScore = prev + cleared * 100;
        if (newScore > highScore) {
          setHighScore(newScore);
        }
        return newScore;
      });
    }
    return newBoard;
  };

  const tick = () => {
    if (gameOver) return;
    const { x, y } = current.position;
    if (!checkCollision(x, y + 1, current.rotation)) {
      setCurrent((c) => ({ ...c, position: { x, y: y + 1 } }));
    } else {
      let newGrid = placeTetromino(grid, tetromino, rotation, position);
      newGrid = clearRows(newGrid, setScore, highScore, setHighScore);
      newGrid = runExplosions(newGrid, setScore);
      setGrid(newGrid);
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
    if (gameOver) return;
    intervalRef.current = setInterval(tick, INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, [current, gameOver]);

  const handleControl = (direction) => {
    if (gameOver) return;
    const { x, y } = current.position;
    let rotation = current.rotation;
    switch (direction) {
      case "left":
        if (!checkCollision(x - 1, y, rotation))
          setCurrent((c) => ({ ...c, position: { x: x - 1, y } }));
        break;
      case "right":
        if (!checkCollision(x + 1, y, rotation))
          setCurrent((c) => ({ ...c, position: { x: x + 1, y } }));
        break;
      case "down":
        if (!checkCollision(x, y + 1, rotation))
          setCurrent((c) => ({ ...c, position: { x, y: y + 1 } }));
        break;
      case "rotate":
        const nextRotation = (rotation + 1) % current.tetromino.shape.length;
        if (!checkCollision(x, y, nextRotation))
          setCurrent((c) => ({ ...c, rotation: nextRotation }));
        break;
      default:
        break;
    }
  };

  const renderGrid = () => {
    const display = grid.map((row) => [...row]);
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
    {row.map((cell, xIdx) => {
      const color = typeof cell === "object" ? cell.color : cell;
      const isExploding = typeof cell === "object" && cell.exploded;

      return (
        <div
          key={xIdx}
          style={{
            width: 25,
            height: 25,
            backgroundColor: color || "#222",
            border: "1px solid #444",
            boxSizing: "border-box",
            animation: isExploding ? "explodeAnim 0.3s" : undefined,
          }}
        />
      );
    })}
  </div>
));
  const btnStyle = {
    backgroundColor: "#333",
    border: "2px solid #0ff",
    borderRadius: 6,
    padding: "8px 12px",
    color: "white",
    fontWeight: "bold",
    fontFamily: "monospace",
    cursor: "pointer",
    minWidth: 60,
  };

  return (
    <div
      style={{
        backgroundColor: "#000",
        minHeight: "100vh",
        padding: 20,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "monospace",
      }}
    >
      <div
        style={{
          backgroundColor: "#111",
          border: "4px solid #0ff",
          borderRadius: 20,
          padding: 20,
          boxShadow: "0 0 30px #0ff",
          display: "inline-block",
        }}
      >
        <h2
          style={{ color: "white", marginBottom: 5, textAlign: "center" }}
        >
          {gameOver ? "GAME OVER" : `Score: ${score}`}
        </h2>
        <h3
          style={{ color: "#0ff", marginBottom: 10, textAlign: "center" }}
        >
          High Score: {highScore}
        </h3>
        <div
          style={{
            width: COLS * 25,
            backgroundColor: "#000",
            padding: 10,
            borderRadius: 10,
            border: "2px solid #0ff",
          }}
        >
          {renderGrid()}
        </div>

        {!gameOver && (
          <div
            style={{
              marginTop: 30,
              display: "grid",
              gridTemplateAreas: `
                ".    up    ."
                "left rot right"
                ".   down  ."
              `,
              gridTemplateColumns: "repeat(3,60px)",
              gridTemplateRows: "repeat(3,60px)",
              gap: 10,
              justifyContent: "center",
              alignContent: "center",
              width: "100%",
              userSelect: "none",
            }}
          >
            <button
              style={{ ...btnStyle, gridArea: "up" }}
              onClick={() => handleControl("down")}
            >
              ▲
            </button>
            <button
              style={{ ...btnStyle, gridArea: "left" }}
              onClick={() => handleControl("left")}
            >
              ◄
            </button>
            <button
              style={{ ...btnStyle, gridArea: "rot" }}
              onClick={() => handleControl("rotate")}
            >
              ⟳
            </button>
            <button
              style={{ ...btnStyle, gridArea: "right" }}
              onClick={() => handleControl("right")}
            >
              ►
            </button>
            <button
              style={{ ...btnStyle, gridArea: "down" }}
              onClick={() => handleControl("down")}
            >
              ▼
            </button>
          </div>
        )}

        {gameOver && (
          <button
            style={{ ...btnStyle, marginTop: 20 }}
            onClick={() => {
              setGrid(emptyGrid());
              setScore(0);
              setGameOver(false);
              setCurrent({
                tetromino: randomTetromino(),
                rotation: 0,
                position: { x: 3, y: 0 },
              });
            }}
          >
            Restart
          </button>
        )}
      </div>
    </div>
  );
}
