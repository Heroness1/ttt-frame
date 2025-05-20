import { ROWS, COLS } from "./gridUtils";

export const findExplosions = (board) => {
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

export const applyExplosions = (board, explodedCells) => {
  const newGrid = board.map(row => [...row]);
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
