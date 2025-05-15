import React, { useState } from 'react';

const TicTacToe = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);

  const calculateWinner = (board) => {
    const lines = [
      [0,1,2],[3,4,5],[6,7,8],  // rows
      [0,3,6],[1,4,7],[2,5,8],  // cols
      [0,4,8],[2,4,6]           // diagonals
    ];
    for (let [a,b,c] of lines) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return null;
  }

  const winner = calculateWinner(board);

  const handleClick = (index) => {
    if (board[index] || winner) return; // ignore if occupied or game over
    const newBoard = [...board];
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    setIsXNext(!isXNext);
  }

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
  }

  return (
    <div style={{textAlign: 'center', marginTop: '50px'}}>
      <h1>Tic Tac Toe</h1>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 60px)', gap: '10px', justifyContent: 'center'}}>
        {board.map((cell, idx) => (
          <button
            key={idx}
            onClick={() => handleClick(idx)}
            style={{
              width: '60px',
              height: '60px',
              fontSize: '24px',
              cursor: 'pointer'
            }}
          >
            {cell}
          </button>
        ))}
      </div>
      <div style={{marginTop: '20px'}}>
        {winner ? (
          <h2>Winner: {winner}</h2>
        ) : (
          <h2>Next Player: {isXNext ? 'X' : 'O'}</h2>
        )}
        <button onClick={resetGame} style={{marginTop: '15px', padding: '8px 16px', cursor: 'pointer'}}>
          Reset
        </button>
      </div>
    </div>
  );
};

export default TicTacToe;
