import React, { useState, useEffect, useRef } from "react";

const ROWS = 20;
const COLS = 10;
const INTERVAL = 700; // kecepatan jatuh awal

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

// Helper: random tetromino
const randomTetromino = () => {
  const tetrominos = Object.keys(TETROMINOS);
  const rand = tetrominos[Math.floor(Math.random() * tetrominos.length)];
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

  // Check collision helper
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

  // Place tetromino on grid (return new grid)
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

  // Clear full rows and update score
  const clearRows = (board) => {
    let cleared = 0;
    const newBoard = board.filter(row => {
      if (row.every(cell => cell !== null)) {
        cleared++;
        return false; // remove this row
      }
      return true;
    });
    while (newBoard.length < ROWS) {
      newBoard.unshift(Array(COLS).fill(null));
    }
    if (cleared > 0) {
      setScore(prev => prev + cleared * 100);
    }
    return newBoard;
  };

  // Game tick (drop)
  const tick = () => {
    if (gameOver) return;

    const { x, y } = current.position;
    if (!checkCollision(x, y + 1, current.rotation)) {
      setCurrent(c => ({ ...c, position: { x, y: y + 1 } }));
    } else {
      // place tetromino on grid permanently
      const newGrid = placeTetromino();
      const clearedGrid = clearRows(newGrid);
      setGrid(clearedGrid);

      // spawn new tetromino
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

  // Keyboard control
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
          const newRotation = (rotation + 1) % current.tetromino.shape.length;
          if (!checkCollision(x, y, newRotation)) setCurrent(c => ({ ...c, rotation: newRotation }));
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [current, gameOver]);

  // Start game loop
  useEffect(() => {
    if (gameOver) return;

    intervalRef.current = setInterval(tick, INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, [current, gameOver]);

  // Render grid with active tetromino
  const renderGrid = () => {
    // copy grid
    const displayGrid = grid.map(row => row.slice());

    // overlay active tetromino
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
