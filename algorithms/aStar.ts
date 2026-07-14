import type { GridCell, GridType, HeuristicType } from "../utils/types";
import { TERRAIN_WEIGHTS } from "../utils/types";
import { getNeighbors } from "./bfs";

// ─────────────────────────────────────────────
// Heuristics
// ─────────────────────────────────────────────
export function heuristic(
  a: GridCell,
  b: GridCell,
  type: HeuristicType,
): number {
  const dx = Math.abs(a.x - b.x);
  const dy = Math.abs(a.y - b.y);
  switch (type) {
    case "manhattan":
      return dx + dy;
    case "euclidean":
      return Math.sqrt(dx * dx + dy * dy);
    case "chebyshev":
      return Math.max(dx, dy);
  }
}

// ─────────────────────────────────────────────
// MinHeap (reuse pattern from dijkstra)
// ─────────────────────────────────────────────
class MinHeap {
  private heap: { node: GridCell; f: number }[] = [];

  push(node: GridCell, f: number) {
    this.heap.push({ node, f });
    this.bubbleUp(this.heap.length - 1);
  }

  pop() {
    if (!this.heap.length) return undefined;
    const min = this.heap[0];
    const last = this.heap.pop()!;
    if (this.heap.length) {
      this.heap[0] = last;
      this.sinkDown(0);
    }
    return min;
  }

  get size() {
    return this.heap.length;
  }

  private bubbleUp(i: number) {
    while (i > 0) {
      const p = Math.floor((i - 1) / 2);
      if (this.heap[p].f <= this.heap[i].f) break;
      [this.heap[p], this.heap[i]] = [this.heap[i], this.heap[p]];
      i = p;
    }
  }

  private sinkDown(i: number) {
    const n = this.heap.length;
    while (true) {
      let s = i;
      const l = 2 * i + 1, r = 2 * i + 2;
      if (l < n && this.heap[l].f < this.heap[s].f) s = l;
      if (r < n && this.heap[r].f < this.heap[s].f) s = r;
      if (s === i) break;
      [this.heap[s], this.heap[i]] = [this.heap[i], this.heap[s]];
      i = s;
    }
  }
}

// ─────────────────────────────────────────────
// A* Search
// ─────────────────────────────────────────────
export function aStar(
  grid: GridType,
  startNode: GridCell,
  endNode: GridCell,
  heuristicType: HeuristicType = "manhattan",
): {
  visitedInOrder: GridCell[];
  cameFrom: Map<GridCell, GridCell | null>;
} {
  const visitedInOrder: GridCell[] = [];
  const cameFrom = new Map<GridCell, GridCell | null>();
  const gScore = new Map<GridCell, number>();
  const visited = new Set<GridCell>();

  grid.flat().forEach((c) => gScore.set(c, Infinity));
  gScore.set(startNode, 0);
  cameFrom.set(startNode, null);

  const pq = new MinHeap();
  pq.push(startNode, heuristic(startNode, endNode, heuristicType));

  while (pq.size > 0) {
    const { node: current } = pq.pop()!;
    if (visited.has(current)) continue;
    visited.add(current);
    visitedInOrder.push(current);

    if (current === endNode) break;

    for (const neighbor of getNeighbors(current, grid)) {
      if (visited.has(neighbor) || neighbor.isWall) continue;

      const tentativeG =
        gScore.get(current)! + TERRAIN_WEIGHTS[neighbor.terrain];

      if (tentativeG < gScore.get(neighbor)!) {
        gScore.set(neighbor, tentativeG);
        cameFrom.set(neighbor, current);
        const f = tentativeG + heuristic(neighbor, endNode, heuristicType);
        pq.push(neighbor, f);
      }
    }
  }

  return { visitedInOrder, cameFrom };
}
