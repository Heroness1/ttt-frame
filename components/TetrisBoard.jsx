import React, { useState, useEffect, useRef } from "react";

const ROWS = 20;
const COLS = 10;
const INTERVAL = 500;

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
  O: {
    shape: [[[1, 1], [1, 1]]],
    color: "yellow",
  },
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
  const key = keys[Math.floor(Math.random() * keys.length)];
  return { ...TETROMINOS[key], name: key };
};

const emptyGrid = () => Array.from({ length: ROWS }, () => Array(COLS).fill(null));

export default function TetrisGame() {
  const [grid, setGrid] = useState(emptyGrid());
  const [current, setCurrent] = useState({
    tetromino: randomTetromino(),
    rotation: 0,
    position: { x: 3, y: 0 },
  });
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const intervalRef = useRef();

  useEffect(() => {
    const saved = localStorage.getItem("tetris-high-score");
    if (saved) setHighScore(parseInt(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("tetris-high-score", highScore.toString());
  }, [highScore]);

  const checkCollision = (x, y, rotation) => {
    const shape = current.tetromino.shape[rotation];
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          const newX = x + c;
          const newY = y + r;
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

  const merge = () => {
    const newGrid = grid.map((row) => [...row]);
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

  const clearLines = (grid) => {
    const newGrid = grid.filter((row) => row.some((cell) => cell === null));
    const linesCleared = ROWS - newGrid.length;
    for (let i = 0; i < linesCleared; i++) {
      newGrid.unshift(Array(COLS).fill(null));
    }
    if (linesCleared > 0) {
      setScore((prev) => {
        const newScore = prev + linesCleared * 100;
        if (newScore > highScore) setHighScore(newScore);
        return newScore;
      });
    }
    return newGrid;
  };

  const drop = () => {
    const { x, y, rotation } = current;
    if (!checkCollision(x, y + 1, rotation)) {
      setCurrent((prev) => ({
        ...prev,
        position: { ...prev.position, y: y + 1 },
      }));
    } else {
      const merged = merge();
      const cleared = clearLines(merged);
      setGrid(cleared);
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
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(drop, INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, [current, gameOver]);

  const move = (dir) => {
    const { x, y, rotation } = current;
    if (dir === "left" && !checkCollision(x - 1, y, rotation)) {
      setCurrent((prev) => ({
        ...prev,
        position: { ...prev.position, x: x - 1 },
      }));
    } else if (dir === "right" && !checkCollision(x + 1, y, rotation)) {
      setCurrent((prev) => ({
        ...prev,
        position: { ...prev.position, x: x + 1 },
      }));
    } else if (dir === "down") {
      drop();
    } else if (dir === "rotate") {
      const nextRotation = (rotation + 1) % current.tetromino.shape.length;
      if (!checkCollision(x, y, nextRotation)) {
        setCurrent((prev) => ({
          ...prev,
          rotation: nextRotation,
        }));
      }
    }
  };

  const render = () => {
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
    return display.map((row, ri) => (
      <div key={ri} style={{ display: "flex" }}>
        {row.map((cell, ci) => (
          <div
            key={ci}
            style={{
              width: 25,
              height: 25,
              backgroundColor: cell || "#111",
              border: "1px solid #333",
              boxSizing: "border-box",
            }}
          />
        ))}
      </div>
    ));
  };

  return (
    <div style={{ background: "#000", minHeight: "100vh", color: "#0ff", fontFamily: "monospace", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <h2>{gameOver ? "GAME OVER" : `Score: ${score}`}</h2>
      <h4>High Score: {highScore}</h4>
      <div style={{ border: "4px solid #0ff", padding: 10, borderRadius: 10, boxShadow: "0 0 20px #0ff" }}>
        {render()}
      </div>
      {!gameOver ? (
        <div style={{ marginTop: 20, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div>
            <button onClick={() => move("rotate")}>⟳</button>
          </div>
          <div>
            <button onClick={() => move("left")}>◄</button>
            <button onClick={() => move("down")}>▼</button>
            <button onClick={() => move("right")}>►</button>
          </div>
        </div>
      ) : (
        <button
          style={{ marginTop: 20 }}
          onClick={() => {
            setGrid(emptyGrid());
            setScore(0);
            setGameOver(false);
            setCurrent({ tetromino: randomTetromino(), rotation: 0, position: { x: 3, y: 0 } });
          }}
        >
          Restart
        </button>
      )}
    </div>
  );
}
