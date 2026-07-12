<<<<<<< HEAD
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
=======
import type { FC } from "react";
import { useParams } from "../context/context";

export const GridBoard: FC = () => {
  const { grid } = useParams();
>>>>>>> 2417618345bc5f1b1ce8babf71c6280d864ddcc4

  return (
<<<<<<< HEAD
    <div
      className="flex justify-center items-center"
      style={{ display: "flex", flexDirection: "column" }}
    >
      {grid.map((row, y) => (
        <Row key={y} row={row} y={y} />
      ))}
    </div>
=======
    <section className="grid-shell" aria-label="Pathfinding grid preview">
      <div className="grid-header">
        <div>
          <p className="eyebrow">Live maze board</p>
          <h2>Route map</h2>
        </div>
        <div className="legend" aria-label="Legend">
          <span className="legend-item">
            <i className="legend-dot start" /> Start
          </span>
          <span className="legend-item">
            <i className="legend-dot target" /> Target
          </span>
          <span className="legend-item">
            <i className="legend-dot wall" /> Wall
          </span>
        </div>
      </div>

      <div className="grid-frame">
        <div className="grid-board">
          {grid.map((row, y) => (
            <div key={y} className="grid-row">
              {row.map((cell, x) => {
                let className = "grid-cell";

                if (cell.isStarting) {
                  className += " start";
                } else if (cell.isTarget) {
                  className += " target";
                } else if (cell.isWall) {
                  className += " wall";
                } else if (cell.weight === 5) {
                  className += " weight";
                }

                return (
                  <div
                    key={`${x}-${y}`}
                    className={className}
                    aria-label={`Cell ${x}, ${y}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
>>>>>>> 2417618345bc5f1b1ce8babf71c6280d864ddcc4
  );
};
