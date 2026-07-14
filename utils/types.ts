// ─────────────────────────────────────────────
// CELL STATES
// ─────────────────────────────────────────────
export type CellState =
  | "empty"
  | "wall"
  | "visited"
  | "visitedB" // bidirectional – second frontier
  | "path"
  | "start"
  | "end"
  | "weight";

// ─────────────────────────────────────────────
// TERRAIN (weighted tiles)
// ─────────────────────────────────────────────
export type TerrainType = "normal" | "water" | "sand" | "forest";

export const TERRAIN_WEIGHTS: Record<TerrainType, number> = {
  normal: 1,
  sand: 3,
  forest: 5,
  water: 10,
};

export const TERRAIN_LABELS: Record<TerrainType, string> = {
  normal: "Normal (×1)",
  sand: "Sand (×3)",
  forest: "Forest (×5)",
  water: "Water (×10)",
};

// ─────────────────────────────────────────────
// GRID CELL
// ─────────────────────────────────────────────
export interface GridCell {
  x: number;
  y: number;
  isStart: boolean;
  isEnd: boolean;
  isWall: boolean;
  terrain: TerrainType;
  state: CellState;
  /** g-cost used by Dijkstra / A* during animation display */
  gCost: number;
  /** animation order index – drives wave animation stagger */
  animOrder?: number;
}

export type GridType = GridCell[][];

// ─────────────────────────────────────────────
// ALGORITHMS
// ─────────────────────────────────────────────
export type AlgorithmType =
  | "bfs"
  | "dfs"
  | "dijkstra"
  | "astar"
  | "bidirectional";

export const ALGORITHM_LABELS: Record<AlgorithmType, string> = {
  bfs: "Breadth-First Search",
  dfs: "Depth-First Search",
  dijkstra: "Dijkstra's Algorithm",
  astar: "A* Search",
  bidirectional: "Bidirectional BFS",
};

export const ALGORITHM_DESCRIPTIONS: Record<AlgorithmType, string> = {
  bfs: "Guarantees shortest path (unweighted). Explores all neighbors level by level.",
  dfs: "Does not guarantee shortest path. Explores deeply before backtracking.",
  dijkstra: "Guarantees shortest path (weighted). Uses a priority queue by cost.",
  astar: "Guarantees shortest path. Uses heuristic to guide search — faster than Dijkstra.",
  bidirectional: "Simultaneously searches from start and end. Meets in the middle.",
};

// ─────────────────────────────────────────────
// HEURISTICS (for A*)
// ─────────────────────────────────────────────
export type HeuristicType = "manhattan" | "euclidean" | "chebyshev";

export const HEURISTIC_LABELS: Record<HeuristicType, string> = {
  manhattan: "Manhattan",
  euclidean: "Euclidean",
  chebyshev: "Chebyshev",
};

// ─────────────────────────────────────────────
// INTERACTION MODES
// ─────────────────────────────────────────────
export type ModeType =
  | "setStart"
  | "setEnd"
  | "addWall"
  | "eraseWall"
  | "addTerrain"
  | null;

// ─────────────────────────────────────────────
// MAZE GENERATORS
// ─────────────────────────────────────────────
export type MazeType = "random" | "recursiveDivision" | "prims" | "";

export const MAZE_LABELS: Record<string, string> = {
  "": "No Maze",
  random: "Random Walls",
  recursiveDivision: "Recursive Division",
  prims: "Prim's Algorithm",
};

// ─────────────────────────────────────────────
// ALGORITHM RESULT
// ─────────────────────────────────────────────
export interface AlgorithmResult {
  visitedInOrder: GridCell[];
  visitedBInOrder?: GridCell[]; // second frontier for bidirectional
  shortestPath: GridCell[];
  nodesExplored: number;
  pathLength: number;
  timeTaken: number; // ms
}

// ─────────────────────────────────────────────
// STATS
// ─────────────────────────────────────────────
export interface Stats {
  nodesExplored: number;
  pathLength: number;
  timeTaken: number;
  algorithmName: string;
  pathFound: boolean;
}
