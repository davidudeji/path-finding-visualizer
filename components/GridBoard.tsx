import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "../context/context";
import { Row } from "./Row";
import type { GridCell, GridType } from "../utils/types";
import { clearPathState } from "../utils/startingGrid";

// ─────────────────────────────────────────────
// Responsive cell-size calculation
// ─────────────────────────────────────────────
function useCellSize(cols: number, rows: number): number {
  const [size, setSize] = useState(22);
  useEffect(() => {
    const compute = () => {
      const availW = window.innerWidth - 32;
      const availH = window.innerHeight - 220; // navbar + stats
      const byWidth = Math.floor(availW / cols);
      const byHeight = Math.floor(availH / rows);
      setSize(Math.max(14, Math.min(28, byWidth, byHeight)));
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, [cols, rows]);
  return size;
}

// ─────────────────────────────────────────────
// GridBoard
// ─────────────────────────────────────────────
export const GridBoard: React.FC = () => {
  const {
    grid, setGrid,
    algorithm, heuristic,
    mode, terrain,
    speed, isRunning, setIsRunning,
    setStats,
    startCoord, endCoord,
  } = useParams();

  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;
  const cellSize = useCellSize(cols, rows);

  // Mouse drag state
  const isMouseDown = useRef(false);
  const drawingWall = useRef(true); // true = placing, false = erasing
  const animationTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const workerRef = useRef<Worker | null>(null);

  // ─── Animation helpers ──────────────────────
  const cancelAnimation = useCallback(() => {
    animationTimers.current.forEach(clearTimeout);
    animationTimers.current = [];
    workerRef.current?.terminate();
    workerRef.current = null;
  }, []);

  // ─── Run Algorithm (via Web Worker) ─────────
  const runAlgorithm = useCallback(() => {
    if (isRunning) {
      cancelAnimation();
      setIsRunning(false);
      return;
    }

    // Clear previous path states
    const freshGrid = clearPathState(grid);
    setGrid(freshGrid);
    setStats(null);
    setIsRunning(true);

    const flatGrid = freshGrid.flat();
    const startNode = flatGrid.find((c) => c.isStart);
    const endNode = flatGrid.find((c) => c.isEnd);

    if (!startNode || !endNode) {
      setIsRunning(false);
      return;
    }

    const worker = new Worker(
      new URL("/src/workers/pathfinder.worker.ts", import.meta.url),
      { type: "module" },
    );
    workerRef.current = worker;

    const input: { grid: GridType; startNode: GridCell; endNode: GridCell; algorithm: string; heuristic: string } = {
      grid: freshGrid,
      startNode,
      endNode,
      algorithm,
      heuristic,
    };

    worker.postMessage(input);

    worker.onmessage = (e: MessageEvent<{ visitedInOrder: GridCell[]; visitedBInOrder?: GridCell[]; shortestPath: GridCell[]; nodesExplored: number; pathLength: number; timeTaken: number; pathFound: boolean }>) => {
      const { visitedInOrder, visitedBInOrder, shortestPath, nodesExplored, pathLength, timeTaken, pathFound } = e.data;
      worker.terminate();
      workerRef.current = null;

      // Animate visited nodes
      let delay = 0;

      // Interleave bidirectional visits
      const interleaved: Array<{ cell: GridCell; isFrontierB: boolean }> = [];
      if (visitedBInOrder && visitedBInOrder.length > 0) {
        const maxLen = Math.max(visitedInOrder.length, visitedBInOrder.length);
        for (let i = 0; i < maxLen; i++) {
          if (i < visitedInOrder.length) interleaved.push({ cell: visitedInOrder[i], isFrontierB: false });
          if (i < visitedBInOrder.length) interleaved.push({ cell: visitedBInOrder[i], isFrontierB: true });
        }
      } else {
        visitedInOrder.forEach((cell) => interleaved.push({ cell, isFrontierB: false }));
      }

      interleaved.forEach(({ cell, isFrontierB }, _i) => {
        const t = setTimeout(() => {
          setGrid((prev) => {
            const newGrid = prev.map((row) => [...row]);
            const c = newGrid[cell.y][cell.x];
            if (!c.isStart && !c.isEnd && !c.isWall) {
              newGrid[cell.y][cell.x] = {
                ...c,
                state: isFrontierB ? "visitedB" : "visited",
              };
            }
            return newGrid;
          });
        }, delay);
        animationTimers.current.push(t);
        delay += speed;
      });

      // Animate shortest path after visits complete
      shortestPath.forEach((cell, i) => {
        const t = setTimeout(() => {
          setGrid((prev) => {
            const newGrid = prev.map((row) => [...row]);
            const c = newGrid[cell.y][cell.x];
            if (!c.isStart && !c.isEnd) {
              newGrid[cell.y][cell.x] = { ...c, state: "path" };
            }
            return newGrid;
          });
        }, delay + i * Math.max(speed * 2, 30));
        animationTimers.current.push(t);
      });

      // Final stats
      const finishDelay = delay + shortestPath.length * Math.max(speed * 2, 30) + 100;
      const ft = setTimeout(() => {
        setStats({
          nodesExplored,
          pathLength,
          timeTaken: Math.round(timeTaken * 10) / 10,
          algorithmName: algorithm,
          pathFound,
        });
        setIsRunning(false);
      }, finishDelay);
      animationTimers.current.push(ft);
    };

    worker.onerror = (err) => {
      console.error("[Worker error]", err);
      setIsRunning(false);
    };
  }, [isRunning, grid, algorithm, heuristic, speed, cancelAnimation, setGrid, setIsRunning, setStats]);

  // ─── Mouse Interaction ───────────────────────
  const handleMouseDown = useCallback((x: number, y: number) => {
    if (isRunning) return;
    isMouseDown.current = true;

    const cell = grid[y][x];

    if (mode === "setStart") {
      const oldSx = startCoord.current.x;
      const oldSy = startCoord.current.y;
      startCoord.current = { x, y };
      setGrid((prev) => {
        const g: GridType = prev.map((row) => row.map((c) => ({ ...c })));
        g[oldSy][oldSx] = { ...g[oldSy][oldSx], isStart: false, state: "empty" };
        g[y][x] = { ...g[y][x], isStart: true, isWall: false, state: "start" };
        return g;
      });
      return;
    }

    if (mode === "setEnd") {
      const oldEx = endCoord.current.x;
      const oldEy = endCoord.current.y;
      endCoord.current = { x, y };
      setGrid((prev) => {
        const g: GridType = prev.map((row) => row.map((c) => ({ ...c })));
        g[oldEy][oldEx] = { ...g[oldEy][oldEx], isEnd: false, state: "empty" };
        g[y][x] = { ...g[y][x], isEnd: true, isWall: false, state: "end" };
        return g;
      });
      return;
    }

    if (mode === "addWall") {
      drawingWall.current = !cell.isWall;
      setGrid((prev) => {
        const g: GridType = prev.map((row) => row.map((c) => ({ ...c })));
        if (!g[y][x].isStart && !g[y][x].isEnd) {
          g[y][x] = { ...g[y][x], isWall: drawingWall.current, terrain: "normal", state: drawingWall.current ? "wall" : "empty" };
        }
        return g;
      });
      return;
    }

    if (mode === "eraseWall") {
      setGrid((prev) => {
        const g: GridType = prev.map((row) => row.map((c) => ({ ...c })));
        if (!g[y][x].isStart && !g[y][x].isEnd) {
          g[y][x] = { ...g[y][x], isWall: false, terrain: "normal", state: "empty" };
        }
        return g;
      });
      return;
    }

    if (mode === "addTerrain") {
      setGrid((prev) => {
        const g: GridType = prev.map((row) => row.map((c) => ({ ...c })));
        if (!g[y][x].isStart && !g[y][x].isEnd && !g[y][x].isWall) {
          const alreadySet = g[y][x].terrain === terrain;
          g[y][x] = {
            ...g[y][x],
            terrain: alreadySet ? "normal" : terrain,
            state: alreadySet ? "empty" : "weight",
          };
        }
        return g;
      });
    }
  }, [isRunning, mode, terrain, grid, setGrid, startCoord, endCoord]);

  const handleMouseEnter = useCallback((x: number, y: number) => {
    if (!isMouseDown.current || isRunning) return;

    const cell = grid[y][x];
    if (cell.isStart || cell.isEnd) return;

    if (mode === "addWall") {
      setGrid((prev) => {
        const g: GridType = prev.map((row) => row.map((c) => ({ ...c })));
        if (!g[y][x].isStart && !g[y][x].isEnd) {
          g[y][x] = { ...g[y][x], isWall: drawingWall.current, terrain: "normal", state: drawingWall.current ? "wall" : "empty" };
        }
        return g;
      });
    } else if (mode === "eraseWall") {
      setGrid((prev) => {
        const g: GridType = prev.map((row) => row.map((c) => ({ ...c })));
        g[y][x] = { ...g[y][x], isWall: false, terrain: "normal", state: "empty" };
        return g;
      });
    } else if (mode === "addTerrain") {
      setGrid((prev) => {
        const g: GridType = prev.map((row) => row.map((c) => ({ ...c })));
        if (!g[y][x].isWall) {
          g[y][x] = { ...g[y][x], terrain, state: "weight" };
        }
        return g;
      });
    }
  }, [isRunning, mode, terrain, grid, setGrid]);

  const handleMouseUp = useCallback(() => {
    isMouseDown.current = false;
  }, []);

  // Prevent default drag behavior
  useEffect(() => {
    const prevent = (e: MouseEvent) => e.preventDefault();
    window.addEventListener("mouseup", () => { isMouseDown.current = false; });
    window.addEventListener("dragstart", prevent);
    return () => window.removeEventListener("dragstart", prevent);
  }, []);

  // Expose runAlgorithm globally so Navbar can call it
  useEffect(() => {
    (window as unknown as Record<string, unknown>).__runAlgorithm = runAlgorithm;
    (window as unknown as Record<string, unknown>).__cancelAnimation = cancelAnimation;
    return () => {
      delete (window as unknown as Record<string, unknown>).__runAlgorithm;
      delete (window as unknown as Record<string, unknown>).__cancelAnimation;
    };
  }, [runAlgorithm, cancelAnimation]);

  return (
    <div
      className="grid-container"
      role="grid"
      aria-label="Pathfinding grid"
      aria-rowcount={rows}
      aria-colcount={cols}
      onMouseLeave={() => { isMouseDown.current = false; }}
    >
      {grid.map((row, y) => (
        <Row
          key={y}
          row={row}
          y={y}
          cellSize={cellSize}
          onMouseDown={handleMouseDown}
          onMouseEnter={handleMouseEnter}
          onMouseUp={handleMouseUp}
        />
      ))}
    </div>
  );
};
