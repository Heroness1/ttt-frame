import React, { useState, useEffect, useRef } from "react";
import {
  ROWS,
  COLS,
  emptyGrid,
  checkCollision,
  placeTetromino,
  clearRows,
} from "./gridUtils.js";
import { runExplosions } from "./explosionUtils.js";
import "./explode.css";

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

export default function TetrisBoard() {
  const [grid, setGrid] = useState(emptyGrid());
  const [current, setCurrent] = useState({
    tetromino: randomTetromino(),
    rotation: 0,
    position: { x: 3, y: 0 },
  });
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const intervalRef = useRef(null);

  // Load high score from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("tetris-high-score");
    if (saved) setHighScore(parseInt(saved, 10));
  }, []);

  // Save high score when it changes
  useEffect(() => {
    if (highScore > 0) {
      localStorage.setItem("tetris-high-score", highScore.toString());
    }
  }, [highScore]);

  const tick = () => {
    if (gameOver) return;

    const { x, y } = current.position;
    if (!checkCollision(grid, current.tetromino, current.rotation, { x, y: y + 1 })) {
      setCurrent((c) => ({ ...c, position: { x, y: y + 1 } }));
    } else {
      // Place tetromino on grid
      let newGrid = placeTetromino(grid, current.tetromino, current.rotation, current.position);
      // Clear full rows and update score
      newGrid = clearRows(newGrid, setScore, highScore, setHighScore);
      // Run explosion effect if you have
      newGrid = runExplosions(newGrid, setScore);
      setGrid(newGrid);

      // Spawn new tetromino
      const next = randomTetromino();
      const startPos = { x: 3, y: 0 };

      // Check collision at start pos: if true, game over
      if (checkCollision(newGrid, next, 0, startPos)) {
        setGameOver(true);
        clearInterval(intervalRef.current);
      } else {
        setCurrent({ tetromino: next, rotation: 0, position: startPos });
      }
    }
  };

  // Game loop interval
  useEffect(() => {
    if (gameOver) return;
    intervalRef.current = setInterval(tick, 700);
    return () => clearInterval(intervalRef.current);
  }, [current, gameOver, grid]);

  // Controls handler
  const handleControl = (direction) => {
    if (gameOver) return;

    const { x, y } = current.position;
    let rotation = current.rotation;

    switch (direction) {
      case "left":
        if (!checkCollision(grid, current.tetromino, rotation, { x: x - 1, y })) {
          setCurrent((c) => ({ ...c, position: { x: x - 1, y } }));
        }
        break;
      case "right":
        if (!checkCollision(grid, current.tetromino, rotation, { x: x + 1, y })) {
          setCurrent((c) => ({ ...c, position: { x: x + 1, y } }));
        }
        break;
      case "down":
        if (!checkCollision(grid, current.tetromino, rotation, { x, y: y + 1 })) {
          setCurrent((c) => ({ ...c, position: { x, y: y + 1 } }));
        }
        break;
      case "rotate":
        const nextRotation = (rotation + 1) % current.tetromino.shape.length;
        if (!checkCollision(grid, current.tetromino, nextRotation, { x, y })) {
          setCurrent((c) => ({ ...c, rotation: nextRotation }));
        }
        break;
      default:
        break;
    }
  };

  // Render the grid with current falling tetromino overlay
  const renderGrid = () => {
    // Copy grid to display
    const display = grid.map((row) => [...row]);
    const shape = current.tetromino.shape[current.rotation];
    const { x, y } = current.position;

    // Overlay current tetromino cells onto display grid
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
              width: 25,
              height: 25,
              backgroundColor: cell || "#222",
              border: "1px solid #444",
              boxSizing: "border-box",
            }}
          />
        ))}
      </div>
    ));
  };

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
        <h2 style={{ color: "white", marginBottom: 5, textAlign: "center" }}>
          {gameOver ? "GAME OVER" : `Score: ${score}`}
        </h2>
        <h3 style={{ color: "#0ff", marginBottom: 10, textAlign: "center" }}>
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
              aria-label="Move Down"
            >
              ▼
            </button>
            <button
              style={{ ...btnStyle, gridArea: "left" }}
              onClick={() => handleControl("left")}
              aria-label="Move Left"
            >
              ◄
            </button>
            <button
              style={{ ...btnStyle, gridArea: "rot" }}
              onClick={() => handleControl("rotate")}
              aria-label="Rotate"
            >
              ⟳
            </button>
            <button
              style={{ ...btnStyle, gridArea: "right" }}
              onClick={() => handleControl("right")}
              aria-label="Move Right"
            >
              ►
            </button>
            <button
              style={{ ...btnStyle, gridArea: "down" }}
              onClick={() => handleControl("down")}
              aria-label="Move Down"
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
