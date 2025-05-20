import { ROWS, COLS } from "./gridUtils";

// DFS to find connected same-color blocks
const findConnected = (grid, x, y, color, visited) => {
  const stack = [[x, y]];
  const connected = [];

  while (stack.length) {
    const [cx, cy] = stack.pop();

    if (
      cx < 0 || cx >= COLS ||
      cy < 0 || cy >= ROWS ||
      visited[cy][cx] ||
      !grid[cy][cx] ||
      (typeof grid[cy][cx] === 'object' ? grid[cy][cx].color : grid[cy][cx]) !== color
    ) {
      continue;
    }

    visited[cy][cx] = true;
    connected.push([cx, cy]);

    stack.push([cx + 1, cy]);
    stack.push([cx - 1, cy]);
    stack.push([cx, cy + 1]);
    stack.push([cx, cy - 1]);
  }

  return connected;
};

/**
 * Mark groups of 3+ connected same-color blocks as exploded.
 * Returns { newGrid, exploded, scoreGained }
 */
export const explodeMatches = (grid, combo = 1) => {
  const visited = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
  let exploded = false;
  let scoreGained = 0;

  const newGrid = grid.map(row =>
    row.map(cell => (cell && typeof cell === "object" ? { ...cell, exploded: false } : cell))
  );

  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (newGrid[y][x] && !visited[y][x]) {
        const color = typeof newGrid[y][x] === 'object' ? newGrid[y][x].color : newGrid[y][x];
        const group = findConnected(newGrid, x, y, color, visited);

        if (group.length >= 3) {
          exploded = true;
          scoreGained += group.length * 50 * combo;

          group.forEach(([gx, gy]) => {
            newGrid[gy][gx] = { color, exploded: true };
          });
        }
      }
    }
  }

  return { newGrid, exploded, scoreGained };
};

/**
 * Remove exploded blocks and drop remaining blocks down.
 * Returns new grid.
 */
export const applyExplosion = (grid) => {
  const newGrid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));

  for (let x = 0; x < COLS; x++) {
    let writeRow = ROWS - 1;
    for (let y = ROWS - 1; y >= 0; y--) {
      const cell = grid[y][x];
      if (cell && !(cell.exploded)) {
        newGrid[writeRow][x] = cell;
        writeRow--;
      }
    }
  }

  return newGrid;
};

/**
 * Runs chained explosions until no more explosions.
 * Returns { finalGrid, totalScore }
 */
export const runExplosions = (grid) => {
  let currentGrid = grid;
  let combo = 1;
  let totalScore = 0;

  while (true) {
    const { newGrid, exploded, scoreGained } = explodeMatches(currentGrid, combo);
    if (!exploded) break;

    totalScore += scoreGained;
    currentGrid = applyExplosion(newGrid);
    combo++;
  }

  return { finalGrid: currentGrid, totalScore };
};
