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
  const intervalRef = useRef(null);

  const checkCollision = (x, y, rotation) => {
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
    if (cleared > 0) setScore(prev => prev + cleared * 100);
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
    const handleKey = (e) => {
      if (gameOver) return;
      const { x, y } = current.position;
      let rotation = current.rotation;
      switch (e.key) {
        case "ArrowLeft":
          if (!checkCollision(x - 1, y, rotation)) setCurrent(c => ({ ...c, position: { x: x - 1, y } }));
          break;
        case "ArrowRight":
          if (!checkCollision(x + 1, y, rotation)) setCurrent(c => ({ ...c, position: { x: x + 1, y } }));
          break;
        case "ArrowDown":
          if (!checkCollision(x, y + 1, rotation)) setCurrent(c => ({ ...c, position: { x, y: y + 1 } }));
          break;
        case "ArrowUp":
          const nextRotation = (rotation + 1) % current.tetromino.shape.length;
          if (!checkCollision(x, y, nextRotation)) setCurrent(c => ({ ...c, rotation: nextRotation }));
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
    intervalRef.current = setInterval(tick, INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, [current, gameOver]);

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
              width: 20,
              height: 20,
              backgroundColor: cell || "black",
              border: "1px solid #111",
            }}
          />
        ))}
      </div>
    ));
  };

  return (
    <div>
      <h2 style={{ color: "white" }}>{gameOver ? "Game Over" : `Score: ${score}`}</h2>
      <div>{renderGrid()}</div>
    </div>
  );
}
