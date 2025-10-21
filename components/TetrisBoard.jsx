"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ROWS,
  COLS,
  VISIBLE_ROWS,
  emptyGrid,
  checkCollision,
  placeTetromino,
  clearRows,
} from "./gridUtils";
import { runExplosions } from "./explosionUtils";
import "./explode.css";
import { TETRA_SCORE_ADDRESS, TETRA_SCORE_ABI } from "../lib/tetrascore";
import { connectSmartAccount } from "../lib/metamaskSmart";

const TETROMINOS = {
  I: { shape: [[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],[[0,0,1,0],[0,0,1,0],[0,0,1,0],[0,0,1,0]]], color: "cyan" },
  O: { shape: [[[1,1],[1,1]]], color: "yellow" },
  T: { shape: [[[0,1,0],[1,1,1],[0,0,0]],[[0,1,0],[0,1,1],[0,1,0]],[[0,0,0],[1,1,1],[0,1,0]],[[0,1,0],[1,1,0],[0,1,0]]], color: "purple" },
  S: { shape: [[[0,1,1],[1,1,0],[0,0,0]],[[0,1,0],[0,1,1],[0,0,1]]], color: "green" },
  Z: { shape: [[[1,1,0],[0,1,1],[0,0,0]],[[0,0,1],[0,1,1],[0,1,0]]], color: "red" },
  J: { shape: [[[1,0,0],[1,1,1],[0,0,0]],[[0,1,1],[0,1,0],[0,1,0]],[[0,0,0],[1,1,1],[0,0,1]],[[0,1,0],[0,1,0],[1,1,0]]], color: "blue" },
  L: { shape: [[[0,0,1],[1,1,1],[0,0,0]],[[0,1,0],[0,1,0],[0,1,1]],[[0,0,0],[1,1,1],[1,0,0]],[[1,1,0],[0,1,0],[0,1,0]]], color: "orange" },
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
  const [submitting, setSubmitting] = useState(false);
  const scoreRef = useRef(score);
  const intervalRef = useRef(null);
  const [account, setAccount] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const acc = await connectSmartAccount();
        setAccount(acc);
        console.log("🧠 Smart Account connected:", acc);
      } catch (e) {
        console.error("Login failed:", e);
      }
    })();
  }, []);

  const sendScoreToChain = async (scoreValue) => {
    try {
      if (!account) throw new Error("Smart Account not connected");
      setSubmitting(true);

      const { createPublicClient, http, encodeFunctionData } = await import("viem");
      const { monadTestnet } = await import("viem/chains");
      const { createSmartAccountClient } = await import("permissionless");
      const { pimlicoBundlerActions, pimlicoPaymasterActions } = await import("permissionless/actions/pimlico");

      const PaymasterMode = { SPONSORED: "SPONSORED" }; // ✅ Manual fallback

      const PIMLICO_API_KEY = process.env.NEXT_PUBLIC_PIMLICO_API_KEY;
      const RPC_URL = `https://api.pimlico.io/v2/monad-testnet/rpc?apikey=${PIMLICO_API_KEY}`;
      const PAYMASTER_URL = `https://api.pimlico.io/v2/monad-testnet/paymaster?apikey=${PIMLICO_API_KEY}`;

      const publicClient = createPublicClient({
        chain: monadTestnet,
        transport: http(RPC_URL),
      })
        .extend(pimlicoBundlerActions(RPC_URL))
        .extend(pimlicoPaymasterActions(PAYMASTER_URL));

      const smartAccount = await createSmartAccountClient({
        chain: monadTestnet,
        account: {
          address: account,
          signTransaction: async (tx) => tx,
          signMessage: async (msg) => msg,
        },
        transport: http(RPC_URL),
        paymaster: { mode: PaymasterMode.SPONSORED },
      });

      const data = encodeFunctionData({
        abi: TETRA_SCORE_ABI,
        functionName: "saveScore",
        args: [BigInt(scoreValue)],
      });

      const userOpHash = await smartAccount.sendUserOperation({
        calls: [{ to: TETRA_SCORE_ADDRESS, data, value: 0n }],
      });

      console.log("✅ Score submitted:", scoreValue, "UserOp Hash:", userOpHash);
      alert(`✅ Score ${scoreValue} saved on Monad via Smart Account!`);
    } catch (err) {
      console.error("❌ Failed to send score via Smart Account:", err);
      alert("⚠️ Gagal menyimpan skor ke chain.");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem("tetris-high-score");
    if (saved) setHighScore(parseInt(saved, 10));
  }, []);

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem("tetris-high-score", score.toString());
    }
  }, [score, highScore]);

  const tick = async () => {
    if (gameOver) return;
    const { x, y } = current.position;

    if (!checkCollision(grid, current.tetromino, current.rotation, { x, y: y + 1 })) {
      setCurrent((c) => ({ ...c, position: { x, y: y + 1 } }));
    } else {
      let newGrid = placeTetromino(grid, current.tetromino, current.rotation, current.position);
      const { newGrid: clearedGrid, cleared } = clearRows(newGrid);

      if (cleared > 0) {
        const points = cleared * 100;
        setScore((prev) => {
          scoreRef.current = prev + points;
          return prev + points;
        });
      }

      let finalGrid = clearedGrid;
      if (cleared > 0) {
        const result = runExplosions(clearedGrid);
        finalGrid = result.finalGrid;
        if (result.totalScore > 0) {
          setScore((prev) => {
            scoreRef.current = prev + result.totalScore;
            return prev + result.totalScore;
          });
        }
      }
      setGrid(finalGrid);

      const next = randomTetromino();
      const startPos = { x: Math.floor(COLS / 2) - 2, y: ROWS - VISIBLE_ROWS - 2 };

      if (checkCollision(newGrid, next, 0, startPos)) {
        setGameOver(true);
        clearInterval(intervalRef.current);
        await sendScoreToChain(scoreRef.current);
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
      case "left":
        if (!checkCollision(grid, current.tetromino, rotation, { x: x - 1, y }))
          setCurrent((c) => ({ ...c, position: { x: x - 1, y } }));
        break;
      case "right":
        if (!checkCollision(grid, current.tetromino, rotation, { x: x + 1, y }))
          setCurrent((c) => ({ ...c, position: { x: x + 1, y } }));
        break;
      case "down":
        if (!checkCollision(grid, current.tetromino, rotation, { x, y: y + 1 }))
          setCurrent((c) => ({ ...c, position: { x, y: y + 1 } }));
        break;
      case "rotate":
        const nextRotation = (rotation + 1) % current.tetromino.shape.length;
        if (!checkCollision(grid, current.tetromino, nextRotation, { x, y }))
          setCurrent((c) => ({ ...c, rotation: nextRotation }));
        break;
    }
  };

  const restart = () => {
    setGrid(emptyGrid());
    setScore(0);
    scoreRef.current = 0;
    setGameOver(false);
    setCurrent({ tetromino: randomTetromino(), rotation: 0, position: { x: 3, y: 0 } });
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

  const renderGrid = () => {
    const visibleGrid = grid.slice(ROWS - VISIBLE_ROWS);
    const display = visibleGrid.map((row) => [...row]);
    const { x, y } = current.position;
    const visibleY = y - (ROWS - VISIBLE_ROWS);

    current.tetromino.shape[current.rotation].forEach((row, dy) => {
      row.forEach((cell, dx) => {
        if (cell) {
          const newY = visibleY + dy;
          const newX = x + dx;
          if (newY >= 0 && newY < VISIBLE_ROWS && newX >= 0 && newX < COLS) {
            display[newY][newX] = { color: current.tetromino.color };
          }
        }
      });
    });

    return display.map((row, yIdx) => (
      <div key={yIdx} style={{ display: "flex" }}>
        {row.map((cell, xIdx) => (
          <div
            key={xIdx}
            className={cell?.exploded ? "explode" : ""}
            style={{
              width: 25,
              height: 25,
              backgroundColor: cell?.color || "#222",
              border: "1px solid #444",
            }}
          />
        ))}
      </div>
    ));
  };

  return (
    <div style={{ backgroundColor: "#000", minHeight: "100vh", padding: 20, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "monospace" }}>
      <div style={{ backgroundColor: "#111", border: "4px solid #0ff", borderRadius: 20, padding: 20, boxShadow: "0 0 30px #0ff", display: "inline-block" }}>
        <h2 style={{ color: "white", marginBottom: 5, textAlign: "center" }}>
          {gameOver ? "GAME OVER" : `Score: ${score}`}
        </h2>
        <h3 style={{ color: "#0ff", marginBottom: 10, textAlign: "center" }}>
          High Score: {highScore}
        </h3>
        {submitting && <p style={{ color: "#0f0", textAlign: "center" }}>⏳ Submitting score to Monad...</p>}

        <div className="grid-container" style={{ width: COLS * 25 + 20, height: VISIBLE_ROWS * 25, backgroundColor: "#000", borderRadius: 10, border: "2px solid #0ff", overflow: "hidden" }}>
          {renderGrid()}
        </div>

        <div style={{ marginTop: 30, display: "grid", gridTemplateAreas: `". up ." "left rot right" ". down ."`, gridTemplateColumns: "repeat(3, 60px)", gridTemplateRows: "repeat(3, 50px)", justifyContent: "center", gap: 10 }}>
          <button style={{ ...btnStyle, gridArea: "up" }} onClick={() => handleControl("rotate")}>ROTATE</button>
          <button style={{ ...btnStyle, gridArea: "left" }} onClick={() => handleControl("left")}>LEFT</button>
          <button style={{ ...btnStyle, gridArea: "right" }} onClick={() => handleControl("right")}>RIGHT</button>
          <button style={{ ...btnStyle, gridArea: "down" }} onClick={() => handleControl("down")}>DOWN</button>
        </div>

        {gameOver && (
          <button style={{ ...btnStyle, marginTop: 20, backgroundColor: "#222", border: "2px solid #ff0", color: "#ff0" }} onClick={restart}>
            RESTART
          </button>
        )}
      </div>
    </div>
  );
}