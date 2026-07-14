import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { createStartingGrid, clearPathState, clearWallsAndPath } from "../utils/startingGrid";
import { generateMaze } from "../utils/mazeGenerators";
import type {
  GridType,
  AlgorithmType,
  HeuristicType,
  ModeType,
  TerrainType,
  MazeType,
  Stats,
} from "../utils/types";

// ─────────────────────────────────────────────
// Grid dimensions (responsive-friendly defaults)
// ─────────────────────────────────────────────
export const GRID_ROWS = 25;
export const GRID_COLS = 55;

// ─────────────────────────────────────────────
// Context Shape
// ─────────────────────────────────────────────
interface ParamsContextValue {
  // Grid state
  grid: GridType;
  setGrid: Dispatch<SetStateAction<GridType>>;

  // Algorithm config
  algorithm: AlgorithmType;
  setAlgorithm: Dispatch<SetStateAction<AlgorithmType>>;
  heuristic: HeuristicType;
  setHeuristic: Dispatch<SetStateAction<HeuristicType>>;

  // Interaction
  mode: ModeType;
  setMode: Dispatch<SetStateAction<ModeType>>;
  terrain: TerrainType;
  setTerrain: Dispatch<SetStateAction<TerrainType>>;

  // Animation
  speed: number;
  setSpeed: Dispatch<SetStateAction<number>>;
  isRunning: boolean;
  setIsRunning: Dispatch<SetStateAction<boolean>>;

  // Stats
  stats: Stats | null;
  setStats: Dispatch<SetStateAction<Stats | null>>;

  // Coordinates (refs — don't trigger re-render)
  startCoord: React.MutableRefObject<{ x: number; y: number }>;
  endCoord: React.MutableRefObject<{ x: number; y: number }>;

  // Actions
  resetPath: () => void;
  resetAll: () => void;
  applyMaze: (type: MazeType) => void;
}

const ParamsContext = createContext<ParamsContextValue | undefined>(undefined);

export function useParams() {
  const context = useContext(ParamsContext);
  if (!context) throw new Error("useParams must be used within a ParamsProvider");
  return context;
}

// ─────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────
export function ParamsProvider({ children }: { children: ReactNode }) {
  const startCoord = useRef({ x: 5, y: Math.floor(GRID_ROWS / 2) });
  const endCoord = useRef({ x: GRID_COLS - 6, y: Math.floor(GRID_ROWS / 2) });

  const [grid, setGrid] = useState<GridType>(() =>
    createStartingGrid({
      rows: GRID_ROWS,
      cols: GRID_COLS,
      startCoord: [startCoord.current.x, startCoord.current.y],
      endCoord: [endCoord.current.x, endCoord.current.y],
    }),
  );

  const [algorithm, setAlgorithm] = useState<AlgorithmType>("astar");
  const [heuristic, setHeuristic] = useState<HeuristicType>("manhattan");
  const [mode, setMode] = useState<ModeType>("addWall");
  const [terrain, setTerrain] = useState<TerrainType>("sand");
  const [speed, setSpeed] = useState<number>(15);
  const [isRunning, setIsRunning] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);

  const resetPath = useCallback(() => {
    setGrid((g) => clearPathState(g));
    setStats(null);
  }, []);

  const resetAll = useCallback(() => {
    setGrid(
      createStartingGrid({
        rows: GRID_ROWS,
        cols: GRID_COLS,
        startCoord: [startCoord.current.x, startCoord.current.y],
        endCoord: [endCoord.current.x, endCoord.current.y],
      }),
    );
    setStats(null);
  }, []);

  const applyMaze = useCallback((type: MazeType) => {
    if (!type) return;
    setGrid((g) => {
      const cleared = clearWallsAndPath(g);
      return generateMaze(cleared, type);
    });
    setStats(null);
  }, []);

  const value = useMemo<ParamsContextValue>(
    () => ({
      grid,
      setGrid,
      algorithm,
      setAlgorithm,
      heuristic,
      setHeuristic,
      mode,
      setMode,
      terrain,
      setTerrain,
      speed,
      setSpeed,
      isRunning,
      setIsRunning,
      stats,
      setStats,
      startCoord,
      endCoord,
      resetPath,
      resetAll,
      applyMaze,
    }),
    [grid, algorithm, heuristic, mode, terrain, speed, isRunning, stats, resetPath, resetAll, applyMaze],
  );


  return (
    <ParamsContext.Provider value={value}>{children}</ParamsContext.Provider>
  );
}
