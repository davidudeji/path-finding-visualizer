import type { GridCell, GridType } from "./types";

interface GridConfig {
  rows: number;
  cols: number;
  startCoord?: [number, number]; // [x, y]
  endCoord?: [number, number];   // [x, y]
}

export function createStartingGrid({
  rows,
  cols,
  startCoord = [2, Math.floor(rows / 2)],
  endCoord = [cols - 3, Math.floor(rows / 2)],
}: GridConfig): GridType {
  return Array.from({ length: rows }, (_, y) =>
    Array.from({ length: cols }, (_, x): GridCell => {
      const isStart = x === startCoord[0] && y === startCoord[1];
      const isEnd = x === endCoord[0] && y === endCoord[1];

      return {
        x,
        y,
        isStart,
        isEnd,
        isWall: false,
        terrain: "normal",
        state: isStart ? "start" : isEnd ? "end" : "empty",
        gCost: Infinity,
        animOrder: undefined,
      };
    }),
  );
}

export function clearPathState(grid: GridType): GridType {
  return grid.map((row) =>
    row.map((cell) => ({
      ...cell,
      state: cell.isStart
        ? "start"
        : cell.isEnd
          ? "end"
          : cell.isWall
            ? "wall"
            : cell.terrain !== "normal"
              ? "weight"
              : "empty",
      gCost: Infinity,
      animOrder: undefined,
    })),
  );
}

export function clearWallsAndPath(grid: GridType): GridType {
  return grid.map((row) =>
    row.map((cell) => ({
      ...cell,
      isWall: false,
      terrain: "normal",
      state: cell.isStart ? "start" : cell.isEnd ? "end" : "empty",
      gCost: Infinity,
      animOrder: undefined,
    })),
  );
}
