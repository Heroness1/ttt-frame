export const ROWS = 14;
export const COLS = 10;

export const emptyGrid = () => Array.from({ length: ROWS }, () => Array(COLS).fill(null));

export const copyGrid = (grid) => grid.map((row) => [...row]);

export const checkCollision = (grid, tetromino, rotation, position) => {
  const shape = tetromino.shape[rotation];
  const { x, y } = position;
  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (shape[row][col]) {
        const newX = x + col;
        const newY = y + row;
        if (
          newX < 0 ||
          newX >= COLS ||
          newY >= ROWS ||
          (newY >= 0 && grid[newY][newX])
        )
          return true;
      }
    }
  }
  return false;
};

export const placeTetromino = (board, tetromino, rotation, position) => {
  const newGrid = copyGrid(board);
  const shape = tetromino.shape[rotation];
  const { x, y } = position;
  shape.forEach((row, dy) => {
    row.forEach((cell, dx) => {
      if (cell) {
        const newY = y + dy;
        const newX = x + dx;
        if (newY >= 0) newGrid[newY][newX] = tetromino.color;
      }
    });
  });
  return newGrid;
};

export const clearRows = (board, setScore, highScore, setHighScore) => {
  let cleared = 0;
  const newBoard = board.filter((row) => {
    if (row.every((cell) => cell !== null)) {
      cleared++;
      return false;
    }
    return true;
  });
  while (newBoard.length < ROWS) {
    newBoard.unshift(Array(COLS).fill(null));
  }
  if (cleared > 0) {
    setScore((prev) => {
      const newScore = prev + cleared * 100;
      if (newScore > highScore) {
        setHighScore(newScore);
      }
      return newScore;
    });
  }
  return newBoard;
};
