import React, { useState } from "react";
import { createStartingGrid } from "../utils/startingGrid";
import type { GridType } from "../utils/types";
import { Row } from "./Row";

export const GridBoard: React.FC = () => {
  // 1. STATE INITIALIZATION: Creates the grid layout once when the component loads
  const [grid] = useState<GridType>(() =>
    createStartingGrid({
      rows: 15,
      cols: 15,
      startCoord: [0, 0],
      targetCoord: [12, 12],
    }),
  );

  // 2. RENDERING (The "State Loop"): Loops through the grid state to draw the UI
  return (
    <div
      className="flex justify-center items-center"
      style={{ display: "flex", flexDirection: "column" }}
    >
      {grid.map((row, y) => (
        <Row key={y} row={row} y={y} />
      ))}
    </div>
  );
};
