import type { GridCell, GridType } from "../utils/types";
import { TERRAIN_WEIGHTS } from "../utils/types";
import { getNeighbors } from "./bfs";

class MinHeap {
  private heap: { node: GridCell; priority: number }[] = [];

  push(node: GridCell, priority: number) {
    this.heap.push({ node, priority });
    this.bubbleUp(this.heap.length - 1);
  }

  pop(): { node: GridCell; priority: number } | undefined {
    if (this.heap.length === 0) return undefined;
    const min = this.heap[0];
    const last = this.heap.pop()!;
    if (this.heap.length > 0) {
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
      const parent = Math.floor((i - 1) / 2);
      if (this.heap[parent].priority <= this.heap[i].priority) break;
      [this.heap[parent], this.heap[i]] = [this.heap[i], this.heap[parent]];
      i = parent;
    }
  }

  private sinkDown(i: number) {
    const n = this.heap.length;
    while (true) {
      let smallest = i;
      const l = 2 * i + 1;
      const r = 2 * i + 2;
      if (l < n && this.heap[l].priority < this.heap[smallest].priority) smallest = l;
      if (r < n && this.heap[r].priority < this.heap[smallest].priority) smallest = r;
      if (smallest === i) break;
      [this.heap[smallest], this.heap[i]] = [this.heap[i], this.heap[smallest]];
      i = smallest;
    }
  }
}

/** Dijkstra's algorithm – finds shortest weighted path */
export function dijkstra(
  grid: GridType,
  startNode: GridCell,
  endNode: GridCell,
): {
  visitedInOrder: GridCell[];
  cameFrom: Map<GridCell, GridCell | null>;
  distances: Map<GridCell, number>;
} {
  const visitedInOrder: GridCell[] = [];
  const cameFrom = new Map<GridCell, GridCell | null>();
  const distances = new Map<GridCell, number>();
  const visited = new Set<GridCell>();

  // Initialize distances
  grid.flat().forEach((cell) => distances.set(cell, Infinity));
  distances.set(startNode, 0);
  cameFrom.set(startNode, null);

  const pq = new MinHeap();
  pq.push(startNode, 0);

  while (pq.size > 0) {
    const { node: current } = pq.pop()!;
    if (visited.has(current)) continue;
    visited.add(current);
    visitedInOrder.push(current);

    if (current === endNode) break;

    for (const neighbor of getNeighbors(current, grid)) {
      if (visited.has(neighbor) || neighbor.isWall) continue;

      const edgeWeight = TERRAIN_WEIGHTS[neighbor.terrain];
      const newDist = distances.get(current)! + edgeWeight;

      if (newDist < distances.get(neighbor)!) {
        distances.set(neighbor, newDist);
        cameFrom.set(neighbor, current);
        pq.push(neighbor, newDist);
      }
    }
  }

  return { visitedInOrder, cameFrom, distances };
}
