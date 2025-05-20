import React, { useState, useEffect, useRef } from 'react';
import { ROWS, COLS, emptyGrid, checkCollision, placeTetromino, clearRows } from './gridUtils';
import { runExplosions } from './explosionUtils';
import './explode.css';

const TETROMINOS = {
  I: {
    shape: [
      [[0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0]],
      [[0,1,0,0], [0,1,0,0], [0,1,0,0], [0,1,0,0]],
      [[0,0,0,0], [0,0,0,0], [1,1,1,1], [0,0,0,0]],
      [[0,0,1,0], [0,0,1,0], [0,0,1,0], [0,0,1,0]]
    ],
    color: '#00f0f0',
  },
  O: {
    shape: [[[1,1], [1,1]]],
    color: '#f0f000',
  },
  T: {
    shape: [
      [[0,1,0], [1,1,1], [0,0,0]],
      [[0,1,0], [0,1,1], [0,1,0]],
      [[0,0,0], [1,1,1], [0,1,0]],
      [[0,1,0], [1,1,0], [0,1,0]]
    ],
    color: '#a000f0',
  },
  S: {
    shape: [
      [[0,1,1], [1,1,0], [0,0,0]],
      [[0,1,0], [0,1,1], [0,0,1]]
    ],
    color: '#00f000',
  },
  Z: {
    shape: [
      [[1,1,0], [0,1,1], [0,0,0]],
      [[0,0,1], [0,1,1], [0,1,0]]
    ],
    color: '#f00000',
  },
  J: {
    shape: [
      [[1,0,0], [1,1,1], [0,0,0]],
      [[0,1,1], [0,1,0], [0,1,0]],
      [[0,0,0], [1,1,1], [0,0,1]],
      [[0,1,0], [0,1,0], [1,1,0]]
    ],
    color: '#0000f0',
  },
  L: {
    shape: [
      [[0,0,1], [1,1,1], [0,0,0]],
      [[0,1,0], [0,1,0], [0,1,1]],
      [[0,0,0], [1,1,1], [1,0,0]],
      [[1,1,0], [0,1,0], [0,1,0]]
    ],
    color: '#f0a000',
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
  const scoreRef = useRef(score);

  useEffect(() => {
    const saved = localStorage.getItem('tetris-high-score');
    if (saved) setHighScore(parseInt(saved, 10));
  }, []);

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('tetris-high-score', score.toString());
    }
  }, [score, highScore]);

  const tick = () => {
    if (gameOver) return;
    const { x, y } = current.position;

    if (!checkCollision(grid, current.tetromino, current.rotation, { x, y: y + 1 })) {
      setCurrent((c) => ({ ...c, position: { ...c.position, y: y + 1 } }));
    } else {
      let newGrid = placeTetromino(grid, current.tetromino, current.rotation, current.position);
      
      // Clear rows dan update score
      const clearedResult = clearRows(newGrid);
      newGrid = clearedResult.newGrid;
      setScore((prev) => prev + clearedResult.cleared * 100);

      // Proses ledakan
      const explosionResult = runExplosions(newGrid);
      newGrid = explosionResult.finalGrid;
      setScore((prev) => prev + explosionResult.totalScore);

      setGrid(newGrid);

      // Spawn tetromino baru
      const next = randomTetromino();
      const startPos = { x: 3, y: 0 };

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

  const handleControl = (direction) => {
    if (gameOver) return;

    const { x, y } = current.position;
    let rotation = current.rotation;

    switch (direction) {
      case 'left':
        if (!checkCollision(grid, current.tetromino, rotation, { x: x - 1, y })) {
          setCurrent((c) => ({ ...c, position: { ...c.position, x: x - 1 } }));
        }
        break;
      case 'right':
        if (!checkCollision(grid, current.tetromino, rotation, { x: x + 1, y })) {
          setCurrent((c) => ({ ...c, position: { ...c.position, x: x + 1 } }));
        }
        break;
      case 'down':
        if (!checkCollision(grid, current.tetromino, rotation, { x, y: y + 1 })) {
          setCurrent((c) => ({ ...c, position: { ...c.position, y: y + 1 } }));
        }
        break;
      case 'rotate':
        const nextRotation = (rotation + 1) % current.tetromino.shape.length;
        if (!checkCollision(grid, current.tetromino, nextRotation, { x, y })) {
          setCurrent((c) => ({ ...c, rotation: nextRotation }));
        }
        break;
      default:
        break;
    }
  };

  const restart = () => {
    setGrid(emptyGrid());
    setScore(0);
    setGameOver(false);
    setCurrent({
      tetromino: randomTetromino(),
      rotation: 0,
      position: { x: 3, y: 0 },
    });
  };

  const renderGrid = () => {
    return grid.map((row, y) => (
      <div key={y} style={{ display: 'flex' }}>
        {row.map((cell, x) => (
          <div
            key={x}
            style={{
              width: 25,
              height: 25,
              backgroundColor: cell?.color || cell || '#111',
              border: `1px solid ${cell ? '#333' : '#222'}`,
              animation: cell?.exploded ? 'explodeAnim 0.5s ease-out' : 'none',
            }}
          />
        ))}
      </div>
    ));
  };

  return (
    <div style={{ 
      background: '#000', 
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ 
        background: '#111',
        padding: 20,
        borderRadius: 10,
        border: '2px solid #0ff',
        boxShadow: '0 0 20px #0ff'
      }}>
        <h1 style={{ color: '#fff', textAlign: 'center', margin: 0 }}>
          {gameOver ? 'GAME OVER!' : `Score: ${score}`}
        </h1>
        <p style={{ color: '#0ff', textAlign: 'center' }}>High Score: {highScore}</p>
        
        <div style={{ margin: '20px 0' }}>
          {renderGrid()}
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button onClick={() => handleControl('left')}>← Left</button>
          <button onClick={() => handleControl('rotate')}>↻ Rotate</button>
          <button onClick={() => handleControl('right')}>→ Right</button>
          <button onClick={() => handleControl('down')}>↓ Down</button>
        </div>

        {gameOver && (
          <button 
            onClick={restart}
            style={{ 
              display: 'block',
              margin: '20px auto 0',
              padding: '10px 20px',
              background: '#0ff',
              border: 'none',
              borderRadius: 5,
              cursor: 'pointer'
            }}>
            Restart
          </button>
        )}
      </div>
    </div>
  );
}
