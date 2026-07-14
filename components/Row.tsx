import React from "react";
import type { GridCell } from "../utils/types";
import { Cell } from "./Cell";

type RowProps = {
  row: GridCell[];
  y: number;
  cellSize: number;
  onMouseDown: (x: number, y: number) => void;
  onMouseEnter: (x: number, y: number) => void;
  onMouseUp: () => void;
};

export const Row = React.memo(({ row, y, cellSize, onMouseDown, onMouseEnter, onMouseUp }: RowProps) => (
  <div className="grid-row" role="row" aria-label={`Row ${y}`}>
    {row.map((cell) => (
      <Cell
        key={`${cell.x}-${cell.y}`}
        cell={cell}
        cellSize={cellSize}
        onMouseDown={onMouseDown}
        onMouseEnter={onMouseEnter}
        onMouseUp={onMouseUp}
      />
    ))}
  </div>
));

Row.displayName = "Row";
