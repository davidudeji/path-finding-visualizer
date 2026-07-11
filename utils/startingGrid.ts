import type { GridCell, GridType } from "./types";

interface GridConfig {
  rows: number;
  cols: number;
  startCoord?: [number, number]; // [x, y]
  targetCoord?: [number, number]; // [x, y]
}

export function createStartingGrid({
  rows,
  cols,
  startCoord = [0, 0],
  targetCoord = [rows - 1, cols - 1],
}: GridConfig): GridType {
  // Create an array of rows, then map each row to an array of columns
  return Array.from({ length: rows }, (_, y) =>
    Array.from({ length: cols }, (_, x): GridCell => {
      const isStarting = x === startCoord[0] && y === startCoord[1];
      const isTarget = x === targetCoord[0] && y === targetCoord[1];

      return {
        x,
        y,
        isStarting,
        isTarget,
        isWall: false, // Default to empty path
        weight: 1, // Default weight is 1; can be toggled to 5 later
      };
    }),
  );
}
