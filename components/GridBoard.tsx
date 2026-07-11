import type { FC } from "react";
import { useParams } from "../context/context";

export const GridBoard: FC = () => {
  const { grid } = useParams();

  return (
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
  );
};
