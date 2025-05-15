'use client';

import React, { useEffect, useState } from 'react';

const defaultState = '_________';

export default function TicTacToe() {
  const [state, setState] = useState(defaultState);
  const [boardText, setBoardText] = useState('');
  const [buttons, setButtons] = useState([]);
  const [loading, setLoading] = useState(false);

  async function fetchBoard(move = -1, currentState = state) {
    setLoading(true);
    const url = `/frame?state=${currentState}&move=${move}`;
    const res = await fetch(url);
    const data = await res.json();
    setBoardText(data.text);
    setButtons(data.buttons);
    setLoading(false);

    if (move >= 0) {
      const nextStateMatch = data.buttons[move]?.target.match(/state=([XO_]+)/);
      if (nextStateMatch) {
        setState(nextStateMatch[1]);
      } else {
        setState(currentState);
      }
    }
  }

  useEffect(() => {
    fetchBoard();
  }, []);

  return (
    <div style={{ fontFamily: 'monospace', whiteSpace: 'pre', maxWidth: 300, margin: 'auto' }}>
      <pre>{boardText || 'Loading...'}</pre>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {buttons.map((btn, i) => (
          <button
            key={i}
            disabled={btn.label === '—' || loading}
            onClick={() => fetchBoard(i)}
            style={{
              padding: 16,
              fontSize: 18,
              cursor: btn.label === '—' ? 'not-allowed' : 'pointer',
              backgroundColor: btn.label === '—' ? '#ddd' : '#eee',
              borderRadius: 4,
              border: '1px solid #ccc',
            }}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
}
