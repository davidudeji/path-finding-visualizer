# PathFind — How It's Built: A Complete Technical Explainer

This document explains every layer of the PathFind codebase — from the raw grid data model, through the algorithm implementations, across the React component tree, to the animated pixels on screen. Read it top to bottom or jump to any section.

---

## Table of Contents

1. [Project Architecture Overview](#1-project-architecture-overview)
2. [The Data Model](#2-the-data-model)
3. [Grid Initialization](#3-grid-initialization)
4. [The Five Pathfinding Algorithms](#4-the-five-pathfinding-algorithms)
5. [The Web Worker Pipeline](#5-the-web-worker-pipeline)
6. [Maze Generators](#6-maze-generators)
7. [React Component Tree](#7-react-component-tree)
8. [End-to-End Data Flow](#8-end-to-end-data-flow)
9. [The CSS Animation System](#9-the-css-animation-system)
10. [Responsive Cell Sizing](#10-responsive-cell-sizing)

---

## 1. Project Architecture Overview

```
User interaction
      |
      v
  [Navbar]  <---- useParams() <---- [ParamsProvider / Context]
      |                                       ^
      |  triggers handleRun                   |
      v                                       |
  [GridBoard] ---- postMessage ---> [pathfinder.worker.ts]
      |                                       |
      |  setGrid (per setTimeout)             | algorithm runs
      v                                       |
  [Row] -> [Cell] <- styled by CSS class <--- | result back via onmessage
```

Key architectural decisions:
- React Context is the single source of truth for all state (grid, algorithm, mode, etc.)
- Web Worker runs the algorithm in a separate thread so the grid never freezes
- setGrid + setTimeout chain drives the frame-by-frame animation on the main thread
- React.memo on Cell ensures only cells that actually changed are re-rendered

---

## 2. The Data Model

File: utils/types.ts

Every cell in the grid is a GridCell object:

```ts
interface GridCell {
  x: number;          // column index
  y: number;          // row index
  isStart: boolean;   // is this the start node?
  isEnd: boolean;     // is this the end node?
  isWall: boolean;    // impassable?
  terrain: TerrainType;   // "normal" | "sand" | "forest" | "water"
  state: CellState;       // "empty" | "wall" | "visited" | "visitedB" | "path" | "start" | "end" | "weight"
  gCost: number;      // accumulated cost (used by Dijkstra/A*)
  animOrder?: number; // animation stagger order (reserved)
}
```

The full grid is: GridType = GridCell[][] — a 2D array indexed as grid[y][x].

### Terrain Weights

Terrain affects the cost of entering a cell for weighted algorithms:

```ts
const TERRAIN_WEIGHTS = {
  normal: 1,
  sand:   3,   // 3x harder to traverse
  forest: 5,
  water:  10,
};
```

---

## 3. Grid Initialization

File: utils/startingGrid.ts

### createStartingGrid(config)

Creates the initial 25x55 grid. Maps over rows x cols and for each (x, y) returns a fresh GridCell.

### clearPathState(grid)

Keeps walls and terrain intact, but resets state back to:
- "start" if isStart
- "end" if isEnd
- "wall" if isWall
- "weight" if terrain is non-normal
- "empty" otherwise

Used before re-running an algorithm so visited/path highlights disappear.

### clearWallsAndPath(grid)

Fully resets every cell — removes walls, resets terrain to normal, clears all visual state.
Used before applying a maze.

---

## 4. The Five Pathfinding Algorithms

All algorithms receive (grid, startNode, endNode) and return visited cells in exploration order,
plus a cameFrom map for path reconstruction.

### Shared Primitives (algorithms/bfs.ts)

#### getNeighbors(node, grid)
Returns up to 4 cardinal neighbors (up, down, left, right) within grid bounds.
Used by every algorithm.

#### reconstructPath(cameFrom, endNode)
Traces backwards from endNode through the cameFrom map until it hits null (the start).
Returns the path in forward order via unshift.

---

### BFS — Breadth-First Search (algorithms/bfs.ts)

BFS explores all neighbors at the current "distance level" before moving deeper.
This guarantees the shortest path in unweighted graphs.

```
Data structures:
  queue: GridCell[]          <- FIFO (shift from front)
  visited: Set<GridCell>
  cameFrom: Map<GridCell, GridCell | null>

Algorithm:
  1. Enqueue startNode, mark visited
  2. While queue is not empty:
     a. current = queue.shift()         <- dequeue oldest
     b. Record current in visitedInOrder
     c. If current === endNode -> break
     d. For each neighbor (not visited, not wall):
        - Mark visited
        - Set cameFrom[neighbor] = current
        - Enqueue neighbor
  3. Return { visitedInOrder, cameFrom }
```

Time complexity: O(V + E) where V = cells, E = edges (4 per cell max).

---

### DFS — Depth-First Search (algorithms/dfs.ts)

DFS dives as deep as possible before backtracking. Does NOT guarantee shortest path.

```
Data structures:
  stack: GridCell[]          <- LIFO (pop from back)

The only difference from BFS is stack vs queue — this single change 
fundamentally changes the exploration pattern.
```

---

### Dijkstra's Algorithm (algorithms/dijkstra.ts)

Dijkstra is BFS with a priority queue — always explores the lowest-cost cell next.
Guarantees shortest path even with weighted terrain.

```
For each neighbor:
  edgeWeight = TERRAIN_WEIGHTS[neighbor.terrain]
  newDist = distances[current] + edgeWeight
  if newDist < distances[neighbor]:
    heap.push(neighbor, newDist)   <- sorted by cost
```

#### The MinHeap
Custom binary heap implementation with O(log n) push/pop:
- push(node, priority): add + bubbleUp
- pop(): remove min, swap last to root, sinkDown
- bubbleUp: compare with parent (i-1)/2, swap if smaller
- sinkDown: compare with children 2i+1, 2i+2, swap with smallest

---

### A* Search (algorithms/aStar.ts)

A* is Dijkstra plus a heuristic — an educated guess of remaining distance to goal.

  f(n) = g(n) + h(n)
         -----   -----
      actual cost  heuristic estimate

#### The Three Heuristics

```ts
manhattan:  dx + dy               // best for 4-directional grids
euclidean:  sqrt(dx^2 + dy^2)    // straight-line distance
chebyshev:  max(dx, dy)           // works with diagonal movement
```

---

### Bidirectional BFS (algorithms/bidirectional.ts)

Two BFS frontiers expand simultaneously from start AND end.
Stops the moment they intersect (meeting node found).

```
queueStart -> expands forward frontier (from startNode)
queueEnd   -> expands backward frontier (from endNode)

Each step:
  Pop from queueStart -> if neighbor in visitedEnd -> MEETING POINT FOUND
  Pop from queueEnd   -> if neighbor in visitedStart -> MEETING POINT FOUND
```

Path reconstruction (reconstructBidirectionalPath):
  pathFromStart: trace cameFromStart from meetingNode back to start (unshift)
  pathFromEnd:   trace cameFromEnd from meetingNode to end (push)
  return [...pathFromStart, ...pathFromEnd]

Why faster? BFS = O(b^d). Two frontiers each = O(b^(d/2)). 
For large search depths this is dramatically smaller.

---

## 5. The Web Worker Pipeline

File: src/workers/pathfinder.worker.ts

The algorithm runs in a Web Worker so the UI thread stays responsive.

### Message Flow

```
[GridBoard.tsx]                           [pathfinder.worker.ts]
     |                                          |
     |--- worker.postMessage(input) ----------> |
     |                                          |  runs algorithm
     |                                          |  measures timeTaken
     | <-- worker.onmessage(result) ----------- |
     |                                          |
     |  Animate: forEach cell -> setTimeout
     |  setGrid() per timeout
```

The worker receives a copy of the grid (structured clone) so algorithms 
can use their own internal data structures without touching React state.

---

## 6. Maze Generators

File: utils/mazeGenerators.ts

### Random Walls (generateRandomWalls)
For each cell (not start/end), Math.random() < 0.3 makes it a wall.

### Recursive Division (generateRecursiveDivision)
Divide-and-conquer approach creating mazes with long corridors:
  - Pick a random row/column for a wall with one passage hole
  - Recurse on both sub-areas
  - chooseOrientation: taller area -> horizontal walls, wider -> vertical

### Prims Algorithm (generatePrims)
Generates a perfect maze (every cell reachable, no loops):
  1. Start: all cells are walls
  2. Begin at startNode, add to "in maze" set
  3. Add frontier cells (2 steps away) to frontier list
  4. While frontier is not empty:
     - Pick random frontier cell
     - Find its maze-connected neighbors (2 steps away)
     - Carve a passage to a random such neighbor
     - Add cell to maze, add new frontiers

---

## 7. React Component Tree

```
<ParamsProvider>          <- context.tsx: all global state
  <App>
    <Navbar />            <- toolbar, selectors, stats bar
    <main>
      <GridBoard />       <- grid + mouse events + worker bridge
        {grid.map(row =>
          <Row>           <- flex row container
            {row.map(cell =>
              <Cell />    <- individual cell (React.memo)
            )}
          </Row>
        )}
    </main>
  </App>
</ParamsProvider>
```

### ParamsProvider / Context (context/context.tsx)

State owned by the context:

| State       | Type          | Default       | Purpose                       |
|-------------|---------------|---------------|-------------------------------|
| grid        | GridType      | createStartingGrid() | The 2D cell array       |
| algorithm   | AlgorithmType | "astar"       | Selected algorithm            |
| heuristic   | HeuristicType | "manhattan"   | A* heuristic                  |
| mode        | ModeType      | "addWall"     | Current interaction mode      |
| terrain     | TerrainType   | "sand"        | Terrain type to paint         |
| speed       | number        | 15            | Animation delay (ms)          |
| isRunning   | boolean       | false         | Algorithm running flag        |
| stats       | Stats / null  | null          | Post-run stats                |
| startCoord  | useRef        | {x:5, y:12}  | Start position (ref, no re-render) |
| endCoord    | useRef        | {x:49, y:12} | End position (ref, no re-render)   |

Why startCoord/endCoord are Refs: Moving start/end requires reading their current
position synchronously inside mouse event handlers. useRef gives a mutable container 
that is always current without triggering re-renders (avoiding stale closure problems).

### GridBoard (components/GridBoard.tsx)

The most complex component — owns mouse interaction, worker lifecycle, and animation scheduling.

Mouse handlers:
- handleMouseDown(x, y) — dispatches based on mode (setStart, setEnd, addWall, eraseWall, addTerrain)
- handleMouseEnter(x, y) — fires while dragging (isMouseDown.current === true)
- handleMouseUp() — resets drag flag

runAlgorithm() flow:
  1. Clear path, set isRunning
  2. Spawn Web Worker, post message
  3. On response: build interleaved animation list (bidirectional interleaves both frontiers)
  4. Schedule setGrid calls via setTimeout (delay += speed ms each cell)
  5. After visits: animate path cells (2x speed for dramatic reveal)
  6. Final timeout: setStats(), clear isRunning

The window.__runAlgorithm bridge:
GridBoard registers runAlgorithm on window via useEffect so Navbar can call it
without prop-drilling. This is a pragmatic workaround for the toolbar -> grid 
communication pattern.

### Cell (components/Cell.tsx)

getCellClassName(cell) maps cell state to CSS class:
  isStart  -> "cell cell-start"
  isEnd    -> "cell cell-end"
  isWall   -> "cell cell-wall"
  visited  -> "cell cell-visited"
  visitedB -> "cell cell-visited-b"
  path     -> "cell cell-path"
  weight   -> "cell cell-weight-{terrain}"
  default  -> "cell cell-empty"

React.memo custom comparator: Only re-renders when state, isWall, isStart, isEnd,
terrain, or cellSize changes. Critical performance optimization — without it, all 1375
cells would re-render per animation frame. With it, only the one changed cell re-renders.

---

## 8. End-to-End Data Flow

```
1. User clicks "Visualize"
   -> NavButton -> handleRun() -> window.__runAlgorithm()

2. GridBoard.runAlgorithm() fires
   -> setGrid(clearPathState(grid))
   -> setIsRunning(true)
   -> new Worker -> worker.postMessage(input)

3. Worker runs off-thread
   -> calls algorithm function
   -> reconstructPath()
   -> self.postMessage(result)

4. Main thread: worker.onmessage
   -> worker.terminate()
   -> Schedule animation loop:
      -> Visited cells: setGrid per setTimeout (delay += speed each)
      -> Path cells: setGrid per setTimeout (delay += speed*2 each)
      -> Stats timeout: setStats(), setIsRunning(false)

5. Each setGrid -> React reconcile
   -> Row re-renders -> Cell.memo checks -> only changed cell re-renders
      -> New CSS class applied -> keyframe animation plays
```

---

## 9. The CSS Animation System

File: src/index.css

Each cell state has a dedicated CSS class with a @keyframes animation:

| Class             | Animation                  | Effect                                    |
|-------------------|---------------------------|-------------------------------------------|
| .cell-wall        | pop-wall 180ms            | Scale 0.6 to 1.15 to 1, fade in          |
| .cell-visited     | fade-visited 300ms        | Scale + rotate from indigo, settle to blue|
| .cell-visited-b   | fade-visited-b 300ms      | Same but from cyan (2nd frontier)         |
| .cell-path        | sweep-path 350ms          | Scale 0.4 to 1.2 to 1, yellow glow       |
| .cell-start       | pulse-start 2s infinite   | Green box-shadow pulse                    |
| .cell-end         | pulse-end 2s infinite     | Red box-shadow pulse                      |

Because React.memo causes only one cell's class to change at a time, each cell plays
its animation independently — creating the sequential wave effect without any manual
animation orchestration. The timing comes entirely from the setTimeout delays in GridBoard.

CSS variables (--color-cell-visited, etc.) make all colors configurable from one :root block.

---

## 10. Responsive Cell Sizing

useCellSize(cols, rows) custom hook in GridBoard.tsx:

```
availW = window.innerWidth - 32       (subtract padding)
availH = window.innerHeight - 220     (subtract navbar height)

byWidth  = floor(availW / cols)
byHeight = floor(availH / rows)

size = clamp(14, min(byWidth, byHeight), 28)
```

- Large displays: cells up to 28px
- Small displays: cells shrink to minimum 14px
- A window.resize listener updates the size dynamically

---

*This explainer was written to accompany the PathFind codebase.*
