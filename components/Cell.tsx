import React from "react";
import type { GridCell } from "../utils/types";

// ─────────────────────────────────────────────
// Cell class derivation (determines CSS class + aria role)
// ─────────────────────────────────────────────
function getCellClassName(cell: GridCell): string {
  if (cell.isStart) return "cell cell-start";
  if (cell.isEnd) return "cell cell-end";
  if (cell.isWall) return "cell cell-wall";

  switch (cell.state) {
    case "visited":  return "cell cell-visited";
    case "visitedB": return "cell cell-visited-b";
    case "path":     return "cell cell-path";
    case "weight":
      switch (cell.terrain) {
        case "sand":   return "cell cell-weight-sand";
        case "water":  return "cell cell-weight-water";
        case "forest": return "cell cell-weight-forest";
        default:       return "cell cell-empty";
      }
    default:         return "cell cell-empty";
  }
}

// ─────────────────────────────────────────────
// Cell icon (for start/end nodes + terrain indicators)
// ─────────────────────────────────────────────
function CellIcon({ cell }: { cell: GridCell }) {
  if (cell.isStart) {
    return (
      <svg viewBox="0 0 16 16" width="10" height="10" fill="white">
        <polygon points="2,1 14,8 2,15" />
      </svg>
    );
  }
  if (cell.isEnd) {
    return (
      <svg viewBox="0 0 16 16" width="10" height="10" fill="white">
        <circle cx="8" cy="8" r="5" />
        <circle cx="8" cy="8" r="2" fill="#ef4444" />
      </svg>
    );
  }
  if (cell.state === "weight" && cell.terrain !== "normal") {
    const icons: Record<string, string> = {
      sand: "~",
      water: "≈",
      forest: "♦",
    };
    return (
      <span style={{ fontSize: "7px", color: "rgba(255,255,255,0.5)", lineHeight: 1 }}>
        {icons[cell.terrain] ?? ""}
      </span>
    );
  }
  return null;
}

// ─────────────────────────────────────────────
// Cell Props
// ─────────────────────────────────────────────
type CellProps = {
  cell: GridCell;
  cellSize: number;
  onMouseDown: (x: number, y: number) => void;
  onMouseEnter: (x: number, y: number) => void;
  onMouseUp: () => void;
};

export const Cell = React.memo(
  ({ cell, cellSize, onMouseDown, onMouseEnter, onMouseUp }: CellProps) => {
    return (
      <div
        className={getCellClassName(cell)}
        style={{
          width: cellSize,
          height: cellSize,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
        role="gridcell"
        aria-label={`Cell ${cell.x},${cell.y}: ${cell.isStart ? "start" : cell.isEnd ? "end" : cell.isWall ? "wall" : cell.state}`}
        onMouseDown={() => onMouseDown(cell.x, cell.y)}
        onMouseEnter={() => onMouseEnter(cell.x, cell.y)}
        onMouseUp={onMouseUp}
      >
        <CellIcon cell={cell} />
      </div>
    );
  },
  (prev, next) =>
    prev.cell.state === next.cell.state &&
    prev.cell.isWall === next.cell.isWall &&
    prev.cell.isStart === next.cell.isStart &&
    prev.cell.isEnd === next.cell.isEnd &&
    prev.cell.terrain === next.cell.terrain &&
    prev.cellSize === next.cellSize,
);

Cell.displayName = "Cell";
