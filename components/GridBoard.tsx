import React, { useState } from "react";
import { createStartingGrid } from "../utils/startingGrid";
import type { GridType } from "../utils/types";

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
      className="flex justify-center items-center "
      style={{ display: "flex", flexDirection: "column" }}
    >
      {grid.map((row, y) => (
        <div key={y} className="grid-row" style={{ display: "flex" }}>
          {row.map((cell, x) => (
            <div
              key={`${x}-${y}`}
              style={{
                width: "30px",
                height: "30px",
                border: "1px solid #ccc",
                backgroundColor: cell.isStarting
                  ? "green"
                  : cell.isTarget
                    ? "red"
                    : "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "10px",
              }}
            >
              {cell.weight}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
