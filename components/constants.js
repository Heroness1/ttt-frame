

export const ROWS = 14;
export const COLS = 10;

export const INTERVAL = 500;

export const TETROMINO_COLORS = {
  I: "cyan",
  O: "yellow",
  T: "purple",
  S: "green",
  Z: "red",
  J: "blue",
  L: "orange",
};

export const DIRECTIONS = {
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
  DOWN: { x: 0, y: 1 },
};

export const CELL_SIZE = 30;

export const BASE_SCORE = 100;
export const COMBO_MULTIPLIER = 1.5;
export const EXPLOSION_THRESHOLD = 3;
