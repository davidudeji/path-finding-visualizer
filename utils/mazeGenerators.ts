import type { GridType, MazeType } from "./types";

// ─────────────────────────────────────────────
// RANDOM WALLS
// ─────────────────────────────────────────────
export function generateRandomWalls(grid: GridType, density = 0.3): GridType {
  return grid.map((row) =>
    row.map((cell) => {
      if (cell.isStart || cell.isEnd) return cell;
      const isWall = Math.random() < density;
      return {
        ...cell,
        isWall,
        state: isWall ? "wall" : "empty",
        terrain: "normal",
      };
    }),
  );
}

// ─────────────────────────────────────────────
// RECURSIVE DIVISION
// ─────────────────────────────────────────────
function addWallsRecursive(
  grid: GridType,
  rowStart: number,
  rowEnd: number,
  colStart: number,
  colEnd: number,
  orientation: "horizontal" | "vertical",
): void {
  if (rowEnd - rowStart < 2 || colEnd - colStart < 2) return;

  if (orientation === "horizontal") {
    // pick even row for wall, odd column for passage
    const wallRow = rowStart + 1 + 2 * Math.floor(Math.random() * Math.floor((rowEnd - rowStart) / 2));
    const passCol = colStart + 2 * Math.floor(Math.random() * Math.ceil((colEnd - colStart + 1) / 2));

    for (let c = colStart; c <= colEnd; c++) {
      const cell = grid[wallRow]?.[c];
      if (cell && !cell.isStart && !cell.isEnd && c !== passCol) {
        cell.isWall = true;
        cell.state = "wall";
      }
    }

    const nextOrientation = chooseOrientation(rowEnd - rowStart - 1, colEnd - colStart);
    addWallsRecursive(grid, rowStart, wallRow - 1, colStart, colEnd, nextOrientation);
    addWallsRecursive(grid, wallRow + 1, rowEnd, colStart, colEnd, nextOrientation);
  } else {
    // vertical
    const wallCol = colStart + 1 + 2 * Math.floor(Math.random() * Math.floor((colEnd - colStart) / 2));
    const passRow = rowStart + 2 * Math.floor(Math.random() * Math.ceil((rowEnd - rowStart + 1) / 2));

    for (let r = rowStart; r <= rowEnd; r++) {
      const cell = grid[r]?.[wallCol];
      if (cell && !cell.isStart && !cell.isEnd && r !== passRow) {
        cell.isWall = true;
        cell.state = "wall";
      }
    }

    const nextOrientation = chooseOrientation(rowEnd - rowStart, colEnd - colStart - 1);
    addWallsRecursive(grid, rowStart, rowEnd, colStart, wallCol - 1, nextOrientation);
    addWallsRecursive(grid, rowStart, rowEnd, wallCol + 1, colEnd, nextOrientation);
  }
}

function chooseOrientation(height: number, width: number): "horizontal" | "vertical" {
  if (width < height) return "horizontal";
  if (height < width) return "vertical";
  return Math.random() < 0.5 ? "horizontal" : "vertical";
}

export function generateRecursiveDivision(grid: GridType): GridType {
  // Deep clone to avoid mutation issues
  const newGrid: GridType = grid.map((row) =>
    row.map((cell) => ({
      ...cell,
      isWall: false,
      state: cell.isStart ? "start" : cell.isEnd ? "end" : ("empty" as const),
      terrain: "normal" as const,
    })),
  );

  const rows = newGrid.length;
  const cols = newGrid[0].length;
  const orientation = chooseOrientation(rows, cols);
  addWallsRecursive(newGrid, 0, rows - 1, 0, cols - 1, orientation);
  return newGrid;
}

// ─────────────────────────────────────────────
// PRIM'S ALGORITHM (MST maze)
// ─────────────────────────────────────────────
export function generatePrims(grid: GridType): GridType {
  const rows = grid.length;
  const cols = grid[0].length;

  // Start: all walls
  const newGrid: GridType = grid.map((row) =>
    row.map((cell) => ({
      ...cell,
      isWall: !cell.isStart && !cell.isEnd,
      state: cell.isStart ? "start" : cell.isEnd ? "end" : ("wall" as const),
      terrain: "normal" as const,
    })),
  );

  const inMaze = new Set<string>();
  const frontier: Array<[number, number]> = [];

  const key = (r: number, c: number) => `${r},${c}`;

  const addFrontier = (r: number, c: number) => {
    if (r >= 0 && r < rows && c >= 0 && c < cols && !inMaze.has(key(r, c))) {
      frontier.push([r, c]);
    }
  };

  // Find start cell
  let startR = 0, startC = 0;
  outer: for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c].isStart) { startR = r; startC = c; break outer; }
    }
  }

  inMaze.add(key(startR, startC));
  newGrid[startR][startC].isWall = false;
  addFrontier(startR - 2, startC);
  addFrontier(startR + 2, startC);
  addFrontier(startR, startC - 2);
  addFrontier(startR, startC + 2);

  while (frontier.length > 0) {
    const idx = Math.floor(Math.random() * frontier.length);
    const [r, c] = frontier.splice(idx, 1)[0];

    if (inMaze.has(key(r, c))) continue;
    if (r < 0 || r >= rows || c < 0 || c >= cols) continue;

    // Find neighbours already in maze (2 steps away)
    const neighbours: Array<[number, number]> = [];
    const dirs = [[-2, 0], [2, 0], [0, -2], [0, 2]];
    for (const [dr, dc] of dirs) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && inMaze.has(key(nr, nc))) {
        neighbours.push([nr, nc]);
      }
    }

    if (neighbours.length > 0) {
      const [nr, nc] = neighbours[Math.floor(Math.random() * neighbours.length)];
      // Carve passage between r,c and nr,nc
      const midR = (r + nr) / 2;
      const midC = (c + nc) / 2;
      const cell = newGrid[r][c];
      const mid = newGrid[midR][midC];

      if (!cell.isStart && !cell.isEnd) { cell.isWall = false; cell.state = "empty"; }
      if (!mid.isStart && !mid.isEnd) { mid.isWall = false; mid.state = "empty"; }

      inMaze.add(key(r, c));
      addFrontier(r - 2, c);
      addFrontier(r + 2, c);
      addFrontier(r, c - 2);
      addFrontier(r, c + 2);
    }
  }

  // Ensure start + end are always clear
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = newGrid[r][c];
      if (cell.isStart || cell.isEnd) { cell.isWall = false; }
    }
  }

  return newGrid;
}

// ─────────────────────────────────────────────
// DISPATCHER
// ─────────────────────────────────────────────
export function generateMaze(grid: GridType, type: MazeType): GridType {
  switch (type) {
    case "random":
      return generateRandomWalls(grid);
    case "recursiveDivision":
      return generateRecursiveDivision(grid);
    case "prims":
      return generatePrims(grid);
    default:
      return grid;
  }
}
