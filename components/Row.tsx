import React from "react";
import type { GridCell } from "../utils/types";
import { Cell } from "./Cell";

type RowProps = {
  row: GridCell[];
  y: number;
};

export const Row: React.FC<RowProps> = React.memo(({ row, y }) => {
  return (
    <div className="flex">
      {row.map((cell, x) => (
        <Cell key={`${x}-${y}`} cell={cell} x={x} y={y} />
      ))}
    </div>
  );
});
