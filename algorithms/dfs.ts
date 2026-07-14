import type { GridCell, GridType } from "../utils/types";
import { getNeighbors, reconstructPath } from "./bfs";

/** DFS – explores as deep as possible before backtracking */
export function dfs(
  grid: GridType,
  startNode: GridCell,
  endNode: GridCell,
): { visitedInOrder: GridCell[]; cameFrom: Map<GridCell, GridCell | null> } {
  const visitedInOrder: GridCell[] = [];
  const cameFrom = new Map<GridCell, GridCell | null>();
  const visited = new Set<GridCell>();

  const stack: GridCell[] = [startNode];
  cameFrom.set(startNode, null);

  while (stack.length > 0) {
    const current = stack.pop()!;

    if (visited.has(current)) continue;
    visited.add(current);
    visitedInOrder.push(current);

    if (current === endNode) break;

    for (const neighbor of getNeighbors(current, grid)) {
      if (!visited.has(neighbor) && !neighbor.isWall) {
        if (!cameFrom.has(neighbor)) cameFrom.set(neighbor, current);
        stack.push(neighbor);
      }
    }
  }

  return { visitedInOrder, cameFrom };
}

export { reconstructPath };
