import type { GridCell, GridType } from "../utils/types";
import { getNeighbors } from "./bfs";

/**
 * Bidirectional BFS – expands two frontiers simultaneously (one from start,
 * one from end).  Meets in the middle for ~O(b^(d/2)) vs O(b^d) complexity.
 */
export function bidirectionalBFS(
  grid: GridType,
  startNode: GridCell,
  endNode: GridCell,
): {
  visitedInOrder: GridCell[];   // forward-frontier visits
  visitedBInOrder: GridCell[];  // backward-frontier visits
  meetingNode: GridCell | null;
  cameFromStart: Map<GridCell, GridCell | null>;
  cameFromEnd: Map<GridCell, GridCell | null>;
} {
  const visitedInOrder: GridCell[] = [];
  const visitedBInOrder: GridCell[] = [];
  const cameFromStart = new Map<GridCell, GridCell | null>();
  const cameFromEnd = new Map<GridCell, GridCell | null>();
  const visitedStart = new Set<GridCell>();
  const visitedEnd = new Set<GridCell>();

  let meetingNode: GridCell | null = null;

  const queueStart: GridCell[] = [startNode];
  const queueEnd: GridCell[] = [endNode];
  cameFromStart.set(startNode, null);
  cameFromEnd.set(endNode, null);
  visitedStart.add(startNode);
  visitedEnd.add(endNode);

  while (queueStart.length > 0 || queueEnd.length > 0) {
    // Expand forward frontier
    if (queueStart.length > 0) {
      const current = queueStart.shift()!;
      visitedInOrder.push(current);

      for (const neighbor of getNeighbors(current, grid)) {
        if (!visitedStart.has(neighbor) && !neighbor.isWall) {
          visitedStart.add(neighbor);
          cameFromStart.set(neighbor, current);
          queueStart.push(neighbor);

          if (visitedEnd.has(neighbor)) {
            meetingNode = neighbor;
            return { visitedInOrder, visitedBInOrder, meetingNode, cameFromStart, cameFromEnd };
          }
        }
      }
    }

    // Expand backward frontier
    if (queueEnd.length > 0) {
      const current = queueEnd.shift()!;
      visitedBInOrder.push(current);

      for (const neighbor of getNeighbors(current, grid)) {
        if (!visitedEnd.has(neighbor) && !neighbor.isWall) {
          visitedEnd.add(neighbor);
          cameFromEnd.set(neighbor, current);
          queueEnd.push(neighbor);

          if (visitedStart.has(neighbor)) {
            meetingNode = neighbor;
            return { visitedInOrder, visitedBInOrder, meetingNode, cameFromStart, cameFromEnd };
          }
        }
      }
    }
  }

  return { visitedInOrder, visitedBInOrder, meetingNode, cameFromStart, cameFromEnd };
}

/** Reconstruct path from bidirectional search meeting node */
export function reconstructBidirectionalPath(
  meetingNode: GridCell,
  cameFromStart: Map<GridCell, GridCell | null>,
  cameFromEnd: Map<GridCell, GridCell | null>,
): GridCell[] {
  const pathFromStart: GridCell[] = [];
  let current: GridCell | null | undefined = meetingNode;
  while (current != null) {
    pathFromStart.unshift(current);
    current = cameFromStart.get(current);
  }

  const pathFromEnd: GridCell[] = [];
  current = cameFromEnd.get(meetingNode);
  while (current != null) {
    pathFromEnd.push(current);
    current = cameFromEnd.get(current);
  }

  return [...pathFromStart, ...pathFromEnd];
}
