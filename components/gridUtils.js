export const ROWS = 18;
export const COLS = 10;
export const VISIBLE_ROWS = 14;
export const emptyGrid = () =>
  Array.from({ length: ROWS }, () => Array(COLS).fill(null));

export const copyGrid = (grid) => grid.map((row) => [...row]);

export const checkCollision = (grid, tetromino, rotation, position) => {
  const shape = tetromino.shape[rotation];
  const { x, y } = position;
  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (shape[row][col]) {
        const newY = y + row;
        const newX = x + col;
        // Cek batas bawah grid
        if (newY >= ROWS) return true; 
        // Cek batas kiri/kanan
        if (newX < 0 || newX >= COLS) return true;
        // Cek tabrakan dengan blok lain
        if (newY >= 0 && grid[newY][newX]) return true;
      }
    }
  }
  return false;
};


export const placeTetromino = (grid, tetromino, rotation, position) => {
  const newGrid = copyGrid(grid);
  const shape = tetromino.shape[rotation];
  const { x, y } = position;

  shape.forEach((row, dy) => {
    row.forEach((cell, dx) => {
      if (cell) {
        const newY = y + dy;
        const newX = x + dx;
        if (newY >= 0 && newY < ROWS && newX >= 0 && newX < COLS) {
          newGrid[newY][newX] = { color: tetromino.color };
      }
    });
  });

  return newGrid;
};
/**
 * Clear full rows, return { newGrid, cleared }
 */
export const clearRows = (grid) => {
  let cleared = 0;
  const newGrid = grid.filter((row) => {
    const full = row.every((cell) => cell !== null);
    if (full) cleared++;
    return !full;
  });
  while (newGrid.length < ROWS) {
    newGrid.unshift(Array(COLS).fill(null));
  }
  return { newGrid, cleared };
};
