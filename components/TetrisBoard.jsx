import React, { useState, useEffect, useRef } from "react";
import { ROWS, COLS, INTERVAL } from "./constants";
import { randomTetromino, TETROMINOS } from "./tetrominos";
import {
  emptyGrid,
  checkCollision,
  placeTetromino,
  clearRows,
} from "./gridUtils";
import { findExplosions, applyExplosions } from "./explosionUtils";

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

  const tick = () => {
  if (gameOver) return;

  const { x, y } = current.position;
  if (!checkCollision(grid, current.tetromino, current.rotation, { x, y: y + 1 })) {
    setCurrent((c) => ({ ...c, position: { x, y: y + 1 } }));
  } else {
    let newGrid = placeTetromino(grid, current.tetromino, current.rotation, current.position);

    const explosions = findExplosions(newGrid);
    if (explosions.length > 0) {
      setExplodingCells(explosions.map(({ x, y }) => ({ x, y, color: newGrid[y][x] })));

      setCombo((prev) => prev + 1);

      setScore((prev) => {
        const comboBonus = combo > 0 ? combo * 50 : 0;
        return prev + explosions.length * 20 + comboBonus;
      });

      newGrid = applyExplosions(newGrid, explosions);
      newGrid = clearRows(newGrid, setScore, highScore, setHighScore);

      setGrid(newGrid);

      setTimeout(() => {
        setExplodingCells([]);
      }, 400);

      const newTetromino = randomTetromino();
      const startPos = { x: 3, y: -1 };

      if (checkCollision(newGrid, newTetromino, 0, startPos)) {
        setGameOver(true);
        clearInterval(intervalRef.current);
      } else {
        setCurrent({
          tetromino: newTetromino,
          rotation: 0,
          position: startPos,
        });
      }
    } else {
      newGrid = clearRows(newGrid, setScore, highScore, setHighScore);
      setGrid(newGrid);
      setCombo(0);

      const newTetromino = randomTetromino();
      const startPos = { x: 3, y: -1 };

      if (checkCollision(newGrid, newTetromino, 0, startPos)) {
        setGameOver(true);
        clearInterval(intervalRef.current);
      } else {
        setCurrent({
          tetromino: newTetromino,
          rotation: 0,
          position: startPos,
        });
      }
    }
  }
};

  useEffect(() => {
    intervalRef.current = setInterval(tick, INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, [grid, current, gameOver, combo]);

  // Movement handlers (move, rotate, drop)
  const rotate = () => {
    const newRotation = (current.rotation + 1) % current.tetromino.shape.length;
    if (!checkCollision(grid, current.tetromino, newRotation, current.position.x, current.position.y)) {
      setCurrent((c) => ({ ...c, rotation: newRotation }));
    }
  };

  const move = (dir) => {
    const newX = current.position.x + dir;
    if (!checkCollision(grid, current.tetromino, current.rotation, newX, current.position.y)) {
      setCurrent((c) => ({ ...c, position: { x: newX, y: c.position.y } }));
    }
  };

  const drop = () => {
    let newY = current.position.y;
    while (!checkCollision(grid, current.tetromino, current.rotation, current.position.x, newY + 1)) {
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
            explodingCells.forEach(({ x: ex, y: ey, color: c }) => {
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
                  boxShadow: color ? "0 0 8px 2px " + color : "inset 0 0 4px #000",
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
        <button style={{ ...btnStyle, gridArea: "up" }} onClick={() => handleControl("down")}>
          ▲
        </button>
        <button style={{ ...btnStyle, gridArea: "left" }} onClick={() => handleControl("left")}>
          ◄
        </button>
        <button style={{ ...btnStyle, gridArea: "rot" }} onClick={() => handleControl("rotate")}>
          ⟳
        </button>
        <button style={{ ...btnStyle, gridArea: "right" }} onClick={() => handleControl("right")}>
          ►
        </button>
        <button style={{ ...btnStyle, gridArea: "down" }} onClick={() => handleControl("down")}>
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
            intervalRef.current = setInterval(tick, INTERVAL);
          }}
        >
          Restart
        </button>
      )}
    </div>
  );
}
