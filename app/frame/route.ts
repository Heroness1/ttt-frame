import { NextRequest, NextResponse } from 'next/server';

const defaultState = '_________'; // 9 posisi kosong

function renderBoard(state: string) {
  return state
    .split('')
    .map((c, i) => {
      if (c === 'X') return '❌';
      if (c === 'O') return '⭕';
      return `${i + 1}`; // nanti diganti tombol
    })
    .reduce((rows, val, idx) => {
      const row = Math.floor(idx / 3);
      rows[row] = (rows[row] || '') + val + ' ';
      return rows;
    }, [] as string[])
    .join('\n');
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const state = searchParams.get('state') ?? defaultState;
  const move = parseInt(searchParams.get('move') || '-1');

  let board = state.split('');
  let current = board.filter(c => c !== '_').length % 2 === 0 ? 'X' : 'O';

  if (move >= 0 && move < 9 && board[move] === '_') {
    board[move] = current;
  }

  const nextState = board.join('');
  const text = renderBoard(nextState);

  return NextResponse.json({
    text: `Tic Tac Toe (Pixel Style)\n\n${text}`,
    buttons: board.map((val, i) => ({
      label: val === '_' ? `${i + 1}` : '—',
      action: 'post',
      target: `/frame?state=${nextState}&move=${i}`
    })).slice(0, 9),
  });
}
