import React from "react";
import type { GridCell } from "../utils/types";

type CellProps = {
  cell: GridCell;
};

export const Cell = React.memo(({ cell }: CellProps) => {
  const classList = ["cell"];

  if (cell.isWall) {
    classList.push("wall");
  }

  return (
    <div
      style={{
        width: "30px",
        height: "30px",
        border: "1px solid #ccc",
        backgroundColor: cell.isStarting
          ? "green"
          : cell.isTarget
            ? "red"
            : "white",
      }}
      className={classList.join(" ")}
      onMouseDown={() => console.log("Mouse down")}
      onMouseEnter={() => console.log("Mouse enter")}
      onMouseUp={() => console.log("Mouse up")}
    >
      {cell.weight}
    </div>
  );
});
