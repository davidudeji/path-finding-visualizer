export interface GridCell {
  x: number;
  y: number;
  isStarting: boolean;
  isTarget: boolean;
  isWall: boolean;
  weight: 1 | 5;
}

export type GridType = GridCell[][];
