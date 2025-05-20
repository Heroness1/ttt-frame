import React, { useState, useEffect, useRef } from "react";

const ROWS = 20;
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

const copyGrid = (grid) => grid.map((row) => [...row]);

export default function TetrisBoard() {
  const [grid, setGrid] = useState(emptyGrid());
  const [current, setCurrent] = useState({
    tetromino: randomTetromino(),
    rotation: 0,
    position: { x: 3, y: -1 },
  });
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [explodingCells, setExplodingCells] = useState([]);
  const [combo, setCombo] = useState(0);
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

  const placeTetromino = (board, tetromino, rotation, position) => {
    const newGrid = copyGrid(board);
    const shape = tetromino.shape[rotation];
    const { x, y } = position;
    shape.forEach((row, dy) => {
      row.forEach((cell, dx) => {
        if (cell) {
          const newY = y + dy;
          const newX = x + dx;
          if (newY >= 0) newGrid[newY][newX] = tetromino.color;
        }
      });
    });
    return newGrid;
  };

  const findExplosions = (board) => {
    const visited = Array.from({ length: ROWS }, () =>
      Array(COLS).fill(false)
    );
    const directions = [
      [0, 1],
      [1, 0],
      [-1, 0],
      [0, -1],
    ];
    let explosions = [];

    const dfs = (x, y, color, group) => {
      if (
        x < 0 ||
        x >= COLS ||
        y < 0 ||
        y >= ROWS ||
        visited[y][x] ||
        board[y][x] !== color
      )
        return;
      visited[y][x] = true;
      group.push({ x, y });
      directions.forEach(([dx, dy]) => dfs(x + dx, y + dy, color, group));
    };

    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        if (board[y][x] && !visited[y][x]) {
          let group = [];
          dfs(x, y, board[y][x], group);
          if (group.length >= 3) {
            explosions = explosions.concat(group);
          }
        }
      }
    }
    return explosions;
  };

  const applyExplosions = (board, explodedCells) => {
    const newGrid = copyGrid(board);
    explodedCells.forEach(({ x, y }) => {
      newGrid[y][x] = null;
    });

    for (let x = 0; x < COLS; x++) {
      let stack = [];
      for (let y = ROWS - 1; y >= 0; y--) {
        if (newGrid[y][x]) stack.push(newGrid[y][x]);
      }
      for (let y = ROWS - 1; y >= 0; y--) {
        newGrid[y][x] = stack.length > 0 ? stack.shift() : null;
      }
    }
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
      let newGrid = placeTetromino(grid, current.tetromino, current.rotation, current.position);
      const explosions = findExplosions(newGrid);

      if (explosions.length > 0) {
        setExplodingCells(explosions.map(({x,y}) => ({x,y,color:newGrid[y][x]})));
        setCombo((prev) => prev + 1);
        setScore((prev) => {
          const comboBonus = combo > 0 ? combo * 50 : 0;
          return prev + explosions.length * 20 + comboBonus;
        });

        newGrid = applyExplosions(newGrid, explosions);
        newGrid = clearRows(newGrid);
        setGrid(newGrid);

        setTimeout(() => {
          setExplodingCells([]);
        }, 400);

        setCurrent({
          tetromino: randomTetromino(),
          rotation: 0,
          position: { x: 3, y: -1 },
        });
      } else {
        newGrid = clearRows(newGrid);
        setGrid(newGrid);
        setCombo(0);
        setCurrent({
          tetromino: randomTetromino(),
          rotation: 0,
          position: { x: 3, y: -1 },
        });
      }
      if (checkCollision(3, 0, 0)) {
        setGameOver(true);
        clearInterval(intervalRef.current);
      }
    }
  };

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      tick();
    }, INTERVAL);

    return () => clearInterval(intervalRef.current);
  });

  const rotate = () => {
    const newRotation = (current.rotation + 1) % current.tetromino.shape.length;
    if (!checkCollision(current.position.x, current.position.y, newRotation)) {
      setCurrent((c) => ({ ...c, rotation: newRotation }));
    }
  };

  const move = (dir) => {
    const newX = current.position.x + dir;
    if (!checkCollision(newX, current.position.y, current.rotation)) {
      setCurrent((c) => ({ ...c, position: { x: newX, y: c.position.y } }));
    }
  };

  const drop = () => {
    let newY = current.position.y;
    while (!checkCollision(current.position.x, newY + 1, current.rotation)) {
      newY++;
    }
    setCurrent((c) => ({ ...c, position: { x: c.position.x, y: newY } }));
  };

  const handleControl = (action) => {
    if (gameOver) return;
    if (action === "left") move(-1);
    else if (action === "right") move(1);
    else if (action === "down") tick();
    else if (action === "rotate") rotate();
    else if (action === "drop") drop();
  };

  const btnStyle = {
    fontSize: 24,
    fontWeight: "bold",
    borderRadius: 6,
    border: "none",
    cursor: "pointer",
    backgroundColor: "#222",
    color: "white",
    userSelect: "none",
  };

  return (
    <div
      style={{
        backgroundColor: "#111",
        width: "360px",
        margin: "auto",
        padding: 20,
        borderRadius: 10,
        boxShadow: "0 0 20px #0ff",
        color: "#0ff",
        fontFamily: "'Courier New', Courier, monospace",
        userSelect: "none",
      }}
    >
      <h2 style={{ textAlign: "center" }}>TetraMON</h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${COLS}, 30px)`,
          gridTemplateRows: `repeat(${ROWS}, 30px)`,
          gap: 1,
          backgroundColor: "#000",
          border: "3px solid #0ff",
        }}
      >
        {grid.map((row, y) =>
          row.map((cell, x) => {
            let color = cell;
            explodingCells.forEach(({x: ex, y: ey, color: c}) => {
              if (ex === x && ey === y) color = c;
            });
            return (
              <div
                key={`${y}-${x}`}
                style={{
                  width: 30,
                  height: 30,
                  backgroundColor: color || "#111",
                  borderRadius: 4,
                  boxShadow: color
                    ? "0 0 8px 2px " + color
                    : "inset 0 0 4px #000",
                  transition: "background-color 0.3s",
                }}
              />
            );
          })
        )}
        {(() => {
          const shape = current.tetromino.shape[current.rotation];
          return shape.map((row, dy) =>
            row.map((cell, dx) => {
              if (!cell) return null;
              const x = current.position.x + dx;
              const y = current.position.y + dy;
              if (y < 0) return null;
              return (
                <div
                  key={`current-${y}-${x}`}
                  style={{
                    gridColumnStart: x + 1,
                    gridRowStart: y + 1,
                    width: 30,
                    height: 30,
                    backgroundColor: current.tetromino.color,
                    borderRadius: 4,
                    boxShadow: `0 0 8px 2px ${current.tetromino.color}`,
                    position: "relative",
                    zIndex: 1,
                  }}
                />
              );
            })
          );
        })()}
      </div>
      <div
        style={{
          marginTop: 20,
          display: "flex",
          justifyContent: "space-between",
          fontSize: 16,
          fontWeight: "bold",
        }}
      >
        <div>Score: {score}</div>
        <div>High Score: {highScore}</div>
        <div>Combo: {combo}</div>
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
      {gameOver && (
        <button
          style={{ ...btnStyle, marginTop: 20, width: "100%" }}
          onClick={() => {
            setGrid(emptyGrid());
            setScore(0);
            setGameOver(false);
            setCombo(0);
            setCurrent({
              tetromino: randomTetromino(),
              rotation: 0,
              position: { x: 3, y: -1 },
            });
          }}
        >
          Restart
        </button>
