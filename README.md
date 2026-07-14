# PathFind — Interactive Pathfinding Visualizer

> Watch algorithms think in real time on a fully interactive grid.

PathFind is a browser-based visualizer that animates five classic pathfinding algorithms on a drag-to-draw grid. You can place walls, paint weighted terrain, generate mazes, and compare how each algorithm navigates from **start** to **end** — all running in a Web Worker so the UI stays buttery smooth.

---

## Live Demo

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com)

---

## Features

| Feature | Details |
|---|---|
| **5 Algorithms** | BFS, DFS, Dijkstra, A\*, Bidirectional BFS |
| **3 Heuristics** | Manhattan, Euclidean, Chebyshev (A\* only) |
| **Weighted Terrain** | Sand x3 · Forest x5 · Water x10 |
| **3 Maze Generators** | Random Walls, Recursive Division, Prim's Algorithm |
| **Interactive Grid** | Click/drag to place walls, move start & end nodes |
| **Animation Control** | Adjustable speed slider, stop mid-animation |
| **Stats Panel** | Nodes explored · Path length · Compute time |
| **Web Workers** | Algorithm runs off-thread — zero UI jank |
| **Responsive** | Cell size auto-scales to any window size |

---

## Tech Stack

- **React 19** + **TypeScript 6**
- **Vite 8** (build + dev server)
- **Tailwind CSS v4** (utility classes)
- **Web Workers** (off-thread algorithm execution)
- **Vanilla CSS animations** (keyframe cell transitions)

---

## Getting Started

### Prerequisites

- Node.js >= 18
- npm >= 9

### Install & Run

```bash
# Clone the repo
git clone https://github.com/your-username/path-finding-visualizer.git
cd path-finding-visualizer

# Install dependencies
npm install

# Start development server
npm run dev
```

Open http://localhost:5173 in your browser.

### Build for Production

```bash
npm run build
```

The production bundle is output to `dist/`.

### Preview Production Build

```bash
npm run preview
```

---

## Deploying to Vercel

The repo ships with a `vercel.json` that configures the build command, output directory, and SPA fallback rewrites automatically.

### Option 1 — Vercel Dashboard (Recommended)

1. Push the repo to GitHub / GitLab / Bitbucket.
2. Go to https://vercel.com/new and import the repo.
3. Vercel auto-detects Vite — click **Deploy**.

### Option 2 — Vercel CLI

```bash
npm i -g vercel
vercel
```

Follow the prompts. The project will be live within seconds.

---

## Project Structure

```
path-finding-visualizer/
├── algorithms/
│   ├── aStar.ts          # A* Search with MinHeap priority queue
│   ├── bfs.ts            # BFS + shared getNeighbors + reconstructPath
│   ├── bidirectional.ts  # Bidirectional BFS (two frontiers)
│   ├── dfs.ts            # Depth-First Search (iterative)
│   └── dijkstra.ts       # Dijkstra with MinHeap + terrain weights
├── components/
│   ├── Cell.tsx          # Single grid cell (React.memo optimised)
│   ├── GridBoard.tsx     # Grid container + mouse logic + worker bridge
│   └── Row.tsx           # Row wrapper
├── context/
│   └── context.tsx       # Global state (React Context + useMemo)
├── navbar/
│   └── navbar.tsx        # Toolbar, controls, stats bar
├── src/
│   ├── App.tsx           # Root component layout
│   ├── main.tsx          # React DOM entry point
│   ├── index.css         # Global styles + cell animations
│   └── workers/
│       └── pathfinder.worker.ts  # Web Worker: runs algorithms off-thread
├── utils/
│   ├── mazeGenerators.ts # Random, Recursive Division, Prim's maze logic
│   ├── startingGrid.ts   # Grid initialisation + clear helpers
│   └── types.ts          # All shared TypeScript types and label maps
├── index.html
├── package.json
├── vite.config.ts
└── vercel.json
```

---

## How to Use

1. **Select an algorithm** from the dropdown (default: A*)
2. **Draw walls** by clicking and dragging on the grid
3. **Move Start / End** nodes using the toolbar mode buttons
4. **(Optional)** Paint weighted terrain or generate a maze
5. Click **Visualize** — watch the algorithm animate!
6. Use **Reset Path** to clear the animation, or **Clear All** to start fresh.

---

## Algorithms at a Glance

| Algorithm | Shortest Path? | Weights? | Notes |
|---|---|---|---|
| BFS | Yes (unweighted) | No | Level-by-level exploration |
| DFS | No | No | Deep-first, not optimal |
| Dijkstra | Yes | Yes | Priority queue by cost |
| A* | Yes | Yes | Heuristic-guided, fastest |
| Bidirectional BFS | Yes (unweighted) | No | Two frontiers meeting in the middle |

---

## Contributing

Pull requests are welcome! Please open an issue first to discuss what you'd like to change.

---

## License

MIT
