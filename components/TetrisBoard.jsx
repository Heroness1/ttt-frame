import React, { useState, useEffect, useRef } from "react";
import "./TetrisStyles.css";

const ROWS = 10;
const COLS = 10;
const INTERVAL = 700;

const TETROMINOS = {
  I: {
    shape: [
      [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ],
      [
        [0, 0, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 1, 0]
      ]
    ],
    color: "darkred"
  },
  O: {
    shape: [
      [
        [1, 1],
        [1, 1]
      ]
    ],
    color: "#990000"
  },
  T: {
    shape: [
      [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0]
      ],
      [
        [0, 1, 0],
        [0, 1, 1],
        [0, 1, 0]
      ],
      [
        [0, 0, 0],
        [1, 1, 1],
        [0, 1, 0]
      ],
      [
        [0, 1, 0],
        [1, 1, 0],
        [0, 1, 0]
      ]
    ],
    color: "#8B0000"
  },
  S: {
    shape: [
      [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0]
      ],
      [
        [0, 1, 0],
        [0, 1, 1],
        [0, 0, 1]
      ]
    ],
    color: "#B22222"
  },
  Z: {
    shape: [
      [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0]
      ],
      [
        [0, 0, 1],
        [0, 1, 1],
        [0, 1, 0]
      ]
    ],
    color: "#A52A2A"
  },
  J: {
    shape: [
      [
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 0]
      ],
      [
        [0, 1, 1],
        [0, 1, 0],
        [0, 1, 0]
      ],
      [
        [0, 0, 0],
        [1, 1, 1],
        [0, 0, 1]
      ],
      [
        [0, 1, 0],
        [0, 1, 0],
        [1, 1, 0]
      ]
    ],
    color: "#5C1A1A"
  },
  L: {
    shape: [
      [
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0]
      ],
      [
        [0, 1, 0],
        [0, 1, 0],
        [0, 1, 1]
      ],
      [
        [0, 0, 0],
        [1, 1, 1],
        [1, 0, 0]
      ],
      [
        [1, 1, 0],
        [0, 1, 0],
        [0, 1, 0]
      ]
    ],
    color: "#7B1E1E"
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
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem("tetris-high-score");
    if (saved) setHighScore(parseInt(saved));
  }, []);

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
            newX < 0 || newX >= COLS ||
            newY >= ROWS ||
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
      setScore(prev => {
        const newScore = prev + cleared * 100;
        if (newScore > highScore) setHighScore(newScore);
        return newScore;
      });
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
      const cleared = clearRows(newGrid);
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
      default:
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
          if (
            newY >= 0 && newY < ROWS &&
            newX >= 0 && newX < COLS
          ) {
            display[newY][newX] = current.tetromino.color;
          }
        }
      });
    });

    return display.map((row, yIdx) => (
      <div key={yIdx} className="row">
        {row.map((cell, xIdx) => (
          <div
            key={xIdx}
            className={`cell ${cell ? cell : ""}`}
            style={{ backgroundColor: cell || "#111" }}
          />
        ))}
      </div>
    ));
  };

  return (
    <div className="tetris-container">
      <div className="score-panel">
        <h2>{gameOver ? "GAME OVER" : `Score: ${score}`}</h2>
        <h3>High Score: {highScore}</h3>
      </div>

      <div className="grid">{renderGrid()}</div>

      <div className="controls">
        <button onClick={() => handleControl("rotate")} style={{ gridArea: "up" }}>⟳</button>
        <button onClick={() => handleControl("left")} style={{ gridArea: "left" }}>◄</button>
        <button onClick={() => handleControl("down")} style={{ gridArea: "down" }}>▼</button>
        <button onClick={() => handleControl("right")} style={{ gridArea: "right" }}>►</button>
      </div>

      {gameOver && (
        <button
          className="restart-button"
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
