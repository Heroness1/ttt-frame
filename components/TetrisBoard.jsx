"use client";
import React, { useEffect, useState, useRef } from "react";
import { TETROMINOS, randomTetromino } from "./tetrominos";
import { ROWS, COLS, DIRECTIONS, INTERVAL } from "./constants";

const createEmptyBoard = () => {
  return Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => ({ filled: false, color: null }))
  );
};

const TetrisBoard = () => {
  const [board, setBoard] = useState(createEmptyBoard());
  const [currentPiece, setCurrentPiece] = useState(null);
  const [position, setPosition] = useState({ x: 3, y: 0 });
  const [rotation, setRotation] = useState(0);
  const intervalRef = useRef(null);

  // Spawn a new piece
  const spawnPiece = () => {
    const newPiece = randomTetromino();
    setCurrentPiece(newPiece);
    setPosition({ x: 3, y: 0 });
    setRotation(0);
  };

  const isValidMove = (piece, pos, rot) => {
    const shape = piece.shape[rot];
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const newY = pos.y + y;
          const newX = pos.x + x;

          if (
            newY >= ROWS ||
            newX < 0 ||
            newX >= COLS ||
            (newY >= 0 && board[newY][newX].filled)
          ) {
            return false;
          }
        }
      }
    }
    return true;
  };

  const mergePiece = () => {
    const shape = currentPiece.shape[rotation];
    const newBoard = board.map((row) => row.slice());

    shape.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell) {
          const newY = position.y + y;
          const newX = position.x + x;
          if (newY >= 0) {
            newBoard[newY][newX] = {
              filled: true,
              color: currentPiece.color,
            };
          }
        }
      });
    });

    setBoard(newBoard);
    spawnPiece();
  };

  const move = (dir) => {
    const newPos = {
      x: position.x + dir.x,
      y: position.y + dir.y,
    };

    if (isValidMove(currentPiece, newPos, rotation)) {
      setPosition(newPos);
    } else if (dir === DIRECTIONS.DOWN) {
      mergePiece();
    }
  };

  const rotate = () => {
    const newRotation = (rotation + 1) % currentPiece.shape.length;
    if (isValidMove(currentPiece, position, newRotation)) {
      setRotation(newRotation);
    }
  };

  useEffect(() => {
    if (!currentPiece) {
      spawnPiece();
      return;
    }

    intervalRef.current = setInterval(() => {
      move(DIRECTIONS.DOWN);
    }, INTERVAL);

    return () => clearInterval(intervalRef.current);
  }, [currentPiece, position, rotation]);

  const renderBoard = () => {
    const display = board.map((row) => row.map((cell) => ({ ...cell })));

    if (currentPiece) {
      const shape = currentPiece.shape[rotation];
      shape.forEach((row, y) => {
        row.forEach((cell, x) => {
          if (cell) {
            const newY = position.y + y;
            const newX = position.x + x;
            if (newY >= 0 && newY < ROWS && newX >= 0 && newX < COLS) {
              display[newY][newX] = {
                filled: true,
                color: currentPiece.color,
              };
            }
          }
        });
      });
    }

    return display.map((row, y) => (
      <div key={y} style={{ display: "flex" }}>
        {row.map((cell, x) => (
          <div
            key={x}
            style={{
              width: 30,
              height: 30,
              border: "1px solid #444",
              backgroundColor: cell.filled ? cell.color : "black",
            }}
          />
        ))}
      </div>
    ));
  };

  return (
    <div
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") move(DIRECTIONS.LEFT);
        else if (e.key === "ArrowRight") move(DIRECTIONS.RIGHT);
        else if (e.key === "ArrowDown") move(DIRECTIONS.DOWN);
        else if (e.key === "ArrowUp") rotate();
      }}
      style={{
        outline: "none",
        display: "inline-block",
        marginTop: 20,
      }}
    >
      {renderBoard()}
    </div>
  );
};

export default TetrisBoard;
