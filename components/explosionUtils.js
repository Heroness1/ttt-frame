import { ROWS, COLS } from "./gridUtils";

// Fungsi untuk mencari grup blok warna sama yang terhubung (DFS)
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
      (grid[cy][cx].color || grid[cy][cx]) !== color
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

// Fungsi utama untuk meledakkan blok yang cocok
export const explodeMatches = (grid, setScore, combo = 1) => {
  const visited = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
  let exploded = false;
  let newGrid = grid.map((row) =>
    row.map((cell) => (cell && typeof cell === "object" ? { ...cell, exploded: false } : cell))
  );

  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (newGrid[y][x] && !visited[y][x]) {
        const color = newGrid[y][x].color || newGrid[y][x];
        const group = findConnected(newGrid, x, y, color, visited);
        if (group.length >= 3) {
          group.forEach(([gx, gy]) => {
            newGrid[gy][gx] = { color, exploded: true };
          });
          exploded = true;
          setScore((prev) => prev + group.length * 50 * combo);
        }
      }
    }
  }

  return { newGrid, exploded };
};

// Hapus blok yang meledak dan jatuhkan yang di atasnya
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

// Jalankan ledakan berantai hingga tak ada lagi
export const runExplosions = (grid, setScore) => {
  let currentGrid = grid;
  let chain = 1;
  let hasExploded = false;

  while (true) {
    const { newGrid, exploded } = explodeMatches(currentGrid, setScore, chain);
    if (!exploded) break;
    currentGrid = applyExplosion(newGrid);
    chain++;
    hasExploded = true;
  }

  return currentGrid;
};
