import type { GridCell, GridType } from "../utils/types";

/** Returns cells in visited order. Path is reconstructed via cameFrom map. */
export function bfs(
  grid: GridType,
  startNode: GridCell,
  endNode: GridCell,
): { visitedInOrder: GridCell[]; cameFrom: Map<GridCell, GridCell | null> } {
  const visitedInOrder: GridCell[] = [];
  const cameFrom = new Map<GridCell, GridCell | null>();
  const visited = new Set<GridCell>();

  const queue: GridCell[] = [startNode];
  cameFrom.set(startNode, null);
  visited.add(startNode);

  while (queue.length > 0) {
    const current = queue.shift()!;
    visitedInOrder.push(current);

    if (current === endNode) break;

    for (const neighbor of getNeighbors(current, grid)) {
      if (!visited.has(neighbor) && !neighbor.isWall) {
        visited.add(neighbor);
        cameFrom.set(neighbor, current);
        queue.push(neighbor);
      }
    }
  }

  return { visitedInOrder, cameFrom };
}

export function getNeighbors(node: GridCell, grid: GridType): GridCell[] {
  const { x, y } = node;
  const neighbors: GridCell[] = [];
  const rows = grid.length;
  const cols = grid[0].length;

  if (y > 0) neighbors.push(grid[y - 1][x]);
  if (y < rows - 1) neighbors.push(grid[y + 1][x]);
  if (x > 0) neighbors.push(grid[y][x - 1]);
  if (x < cols - 1) neighbors.push(grid[y][x + 1]);

  return neighbors;
}

export function reconstructPath(
  cameFrom: Map<GridCell, GridCell | null>,
  endNode: GridCell,
): GridCell[] {
  const path: GridCell[] = [];
  let current: GridCell | null | undefined = endNode;

  while (current != null) {
    path.unshift(current);
    current = cameFrom.get(current);
  }

  return path;
}
