import React, { useState, useEffect, useRef } from "react";

// Grid Constants
const ROWS = 20;
const COLS = 10;

// Empty grid helper
export const emptyGrid = () =>
  Array.from({ length: ROWS }, () => Array(COLS).fill(null));

// Check collision: apakah tetromino nabrak blok di grid pada posisi dan rotasi tertentu
export function checkCollision(grid, tetromino, rotation, pos) {
  const shape = tetromino.shape[rotation];
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x]) {
        const newY = pos.y + y;
        const newX = pos.x + x;
        // cek out of bounds
        if (newX < 0 || newX >= COLS || newY >= ROWS) return true;
        // cek bentrok dengan blok sudah ada
        if (newY >= 0 && grid[newY][newX]) return true;
      }
    }
  }
  return false;
}

// Tempatkan tetromino di grid (immutable)
export function placeTetromino(grid, tetromino, rotation, pos) {
  const shape = tetromino.shape[rotation];
  const newGrid = grid.map((row) => row.slice());
  shape.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell) {
        const newY = pos.y + y;
        const newX = pos.x + x;
        if (newY >= 0 && newY < ROWS && newX >= 0 && newX < COLS) {
          newGrid[newY][newX] = tetromino.color;
        }
      }
    });
  });
  return newGrid;
}

// Clear full rows, update score, return new grid
export function clearRows(grid, setScore, scoreRef) {
  let cleared = 0;
  let newGrid = [];

  for (let y = 0; y < ROWS; y++) {
    if (grid[y].every((cell) => cell !== null)) {
      cleared++;
    } else {
      newGrid.push(grid[y]);
    }
  }

  // Tambah baris kosong di atas sesuai jumlah cleared rows
  while (newGrid.length < ROWS) {
    newGrid.unshift(Array(COLS).fill(null));
  }

  if (cleared > 0) {
    // Score sesuai banyak baris cleared
    const points = cleared * 100;
    setScore((prev) => {
      scoreRef.current = prev + points;
      return prev + points;
    });
  }

  return newGrid;
}

// Explosion logic (placeholder)
export function runExplosions(grid, setScore) {
  // Bisa tambahin animasi ledakan di sini kalau mau
  return grid;
}

// Tetromino shapes dan warna
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
  const scoreRef = useRef(score);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const intervalRef = useRef(null);

  // Load high score dari localStorage
  useEffect(() => {
    const saved = localStorage.getItem("tetris-high-score");
    if (saved) setHighScore(parseInt(saved, 10));
  }, []);

  // Save high score kalau score lebih tinggi
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem("tetris-high-score", score.toString());
    }
  }, [score, highScore]);

  const tick = () => {
    if (gameOver) return;
    const { x, y } = current.position;

    if (!checkCollision(grid, current.tetromino, current.rotation, { x, y: y + 1 })) {
      setCurrent((c) => ({ ...c, position: { x, y: y + 1 } }));
    } else {
      // Tempatkan tetromino ke grid
      let newGrid = placeTetromino(grid, current.tetromino, current.rotation, current.position);

      // Clear rows dan update score
      newGrid = clearRows(newGrid, setScore, scoreRef);

      // Jalankan explosion (placeholder)
      newGrid = runExplosions(newGrid, setScore);

      setGrid(newGrid);

      // Spawn tetromino baru
      const next = randomTetromino();
      const startPos = { x: 3, y: 0 };

      // Cek game over
      if (checkCollision(newGrid, next, 0, startPos)) {
        setGameOver(true);
        clearInterval(intervalRef.current);
      } else {
        setCurrent({ tetromino: next, rotation: 0, position: startPos });
      }
    }
  };

  useEffect(() => {
    if (gameOver) return;
    intervalRef.current = setInterval(tick, 700);
    return () => clearInterval(intervalRef.current);
  }, [current, gameOver, grid]);

  // Kontrol input
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

  // Restart game
  const restart = () => {
    setGrid(emptyGrid());
    setScore(0);
    scoreRef.current = 0;
    setGameOver(false);
    setCurrent({ tetromino: randomTetromino(), rotation: 0, position: { x: 3, y: 0 } });
  };

  // Render grid + current tetromino overlay
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

        <div
          style={{
            marginTop: 30,
            display: "grid",
            gridTemplateAreas: `
              ".    up    ."
              "left rot right"
              ".   down  ."
            `,
            gridTemplateColumns: "repeat(3, 60px)",
            gridTemplateRows: "repeat(3, 50px)",
            justifyContent: "center",
            gap: 10,
            userSelect: "none",
          }}
        >
          <button
            style={{ ...btnStyle, gridArea: "up" }}
            onClick={() => handleControl("rotate")}
          >
            ROTATE
          </button>
          <button
            style={{ ...btnStyle, gridArea: "left" }}
            onClick={() => handleControl("left")}
          >
            LEFT
          </button>
          <button
            style={{ ...btnStyle, gridArea: "right" }}
            onClick={() => handleControl("right")}
          >
            RIGHT
          </button>
          <button
            style={{ ...btnStyle, gridArea: "down" }}
            onClick={() => handleControl("down")}
          >
            DOWN
          </button>
        </div>

        {gameOver && (
          <button
            style={{ ...btnStyle, marginTop: 20, width: "100%" }}
            onClick={restart}
          >
            RESTART
          </button>
        )}
      </div>
    </div>
  );
}
