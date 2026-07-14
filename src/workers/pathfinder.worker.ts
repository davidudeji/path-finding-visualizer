/**
 * Pathfinder Web Worker
 * Runs algorithm computations off the main thread to keep the UI responsive.
 * Receives a WorkerInput message and posts back a WorkerOutput message.
 */

import type { GridCell, GridType, AlgorithmType, HeuristicType } from "../../utils/types";
import { bfs, reconstructPath } from "../../algorithms/bfs";
import { dfs } from "../../algorithms/dfs";
import { dijkstra } from "../../algorithms/dijkstra";
import { aStar } from "../../algorithms/aStar";
import { bidirectionalBFS, reconstructBidirectionalPath } from "../../algorithms/bidirectional";

export interface WorkerInput {
  grid: GridType;
  startNode: GridCell;
  endNode: GridCell;
  algorithm: AlgorithmType;
  heuristic: HeuristicType;
}

export interface WorkerOutput {
  visitedInOrder: GridCell[];
  visitedBInOrder?: GridCell[];
  shortestPath: GridCell[];
  nodesExplored: number;
  pathLength: number;
  timeTaken: number;
  pathFound: boolean;
}

self.onmessage = (e: MessageEvent<WorkerInput>) => {
  const { grid, startNode, endNode, algorithm, heuristic } = e.data;

  const t0 = performance.now();

  let visitedInOrder: GridCell[] = [];
  let visitedBInOrder: GridCell[] | undefined;
  let shortestPath: GridCell[] = [];

  try {
    if (algorithm === "bfs") {
      const result = bfs(grid, startNode, endNode);
      visitedInOrder = result.visitedInOrder;
      shortestPath = reconstructPath(result.cameFrom, endNode);
    } else if (algorithm === "dfs") {
      const result = dfs(grid, startNode, endNode);
      visitedInOrder = result.visitedInOrder;
      shortestPath = reconstructPath(result.cameFrom, endNode);
    } else if (algorithm === "dijkstra") {
      const result = dijkstra(grid, startNode, endNode);
      visitedInOrder = result.visitedInOrder;
      shortestPath = reconstructPath(result.cameFrom, endNode);
    } else if (algorithm === "astar") {
      const result = aStar(grid, startNode, endNode, heuristic);
      visitedInOrder = result.visitedInOrder;
      shortestPath = reconstructPath(result.cameFrom, endNode);
    } else if (algorithm === "bidirectional") {
      const result = bidirectionalBFS(grid, startNode, endNode);
      visitedInOrder = result.visitedInOrder;
      visitedBInOrder = result.visitedBInOrder;
      if (result.meetingNode) {
        shortestPath = reconstructBidirectionalPath(
          result.meetingNode,
          result.cameFromStart,
          result.cameFromEnd,
        );
      }
    }
  } catch (err) {
    console.error("[Worker] Algorithm error:", err);
  }

  const timeTaken = performance.now() - t0;

  // Remove start and end from path ends for cleaner display
  const pathWithoutEnds = shortestPath.filter((c) => !c.isStart && !c.isEnd);
  const pathFound = shortestPath.length > 0 && shortestPath[shortestPath.length - 1] === endNode;

  const output: WorkerOutput = {
    visitedInOrder: visitedInOrder.filter((c) => !c.isStart && !c.isEnd),
    visitedBInOrder: visitedBInOrder?.filter((c) => !c.isStart && !c.isEnd),
    shortestPath: pathWithoutEnds,
    nodesExplored: visitedInOrder.length,
    pathLength: shortestPath.length,
    timeTaken,
    pathFound,
  };

  self.postMessage(output);
};
