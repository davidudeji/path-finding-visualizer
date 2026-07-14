<<<<<<< HEAD
import { useState } from "react";
=======
<<<<<<< HEAD
import "./Navbar.css";
>>>>>>> 9b47e8f8e8d4348f06eb1b2364e334df9a7c3d8e
import { useParams } from "../context/context";
import {
  ALGORITHM_LABELS,
  ALGORITHM_DESCRIPTIONS,
  HEURISTIC_LABELS,
  TERRAIN_LABELS,
  MAZE_LABELS,
  type AlgorithmType,
  type HeuristicType,
  type ModeType,
  type TerrainType,
  type MazeType,
} from "../utils/types";

// ─────────────────────────────────────────────
// Icons (inline SVG micro-icons)
// ─────────────────────────────────────────────
const Icons = {
  play: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
      <polygon points="3,2 13,8 3,14" />
    </svg>
  ),
  stop: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
      <rect x="3" y="3" width="10" height="10" rx="1" />
    </svg>
  ),
  resetPath: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 8a5 5 0 1 0 10 0 5 5 0 0 0-10 0" />
      <path d="M3 8 V4 H7" />
    </svg>
  ),
  resetAll: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M2 8a6 6 0 1 0 12 0 6 6 0 0 0-12 0" />
      <path d="M8 5v3l2 2" />
    </svg>
  ),
  wall: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" opacity="0.9">
      <rect x="1" y="1" width="14" height="6" rx="1" />
      <rect x="1" y="9" width="14" height="6" rx="1" />
      <rect x="4" y="5" width="8" height="2" />
    </svg>
  ),
  erase: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M9 3l4 4-7 7H2v-4z" />
      <path d="M6 6l4 4" />
    </svg>
  ),
  start: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="#10b981">
      <polygon points="3,2 13,8 3,14" />
    </svg>
  ),
  end: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="#ef4444">
      <circle cx="8" cy="8" r="6" />
      <circle cx="8" cy="8" r="3" fill="white" />
    </svg>
  ),
  terrain: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M1 13 L5 5 L8 10 L11 7 L15 13 Z" fill="rgba(255,255,255,0.1)" />
    </svg>
  ),
  maze: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="1" y="1" width="14" height="14" rx="1" />
      <path d="M5 1v5M5 9v6M11 1v3M11 7v8M1 5h4M9 5h6M1 11h10M13 11h2" />
    </svg>
  ),
};

// ─────────────────────────────────────────────
// Sub-component: NavButton
// ─────────────────────────────────────────────
type NavButtonProps = {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  tooltip?: string;
  disabled?: boolean;
  variant?: "default" | "primary" | "danger" | "success";
  id?: string;
};

function NavButton({ active, onClick, children, tooltip, disabled, variant = "default", id }: NavButtonProps) {
  const base = "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150 cursor-pointer select-none whitespace-nowrap";

  const variants = {
    default: active
      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
      : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white",
    primary: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 font-semibold",
    danger: "bg-red-600/80 hover:bg-red-500 text-white",
    success: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 font-semibold",
  };

  return (
    <button
      id={id}
      className={`${base} ${variants[variant]} ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
      onClick={onClick}
      disabled={disabled}
      data-tooltip={tooltip}
      type="button"
    >
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────
// Sub-component: NavSelect
// ─────────────────────────────────────────────
type NavSelectProps<T extends string> = {
  value: T;
  onChange: (v: T) => void;
  options: Array<{ value: T; label: string }>;
  disabled?: boolean;
  id?: string;
};

function NavSelect<T extends string>({ value, onChange, options, disabled, id }: NavSelectProps<T>) {
  return (
    <select
      id={id}
      className="bg-white/5 border border-white/10 text-slate-200 text-sm rounded-md px-3 py-1.5 cursor-pointer hover:bg-white/10 transition-colors focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-40"
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      disabled={disabled}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value} style={{ background: "#0d1225" }}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

// ─────────────────────────────────────────────
// Stats Bar
// ─────────────────────────────────────────────
function StatsBar() {
  const { stats } = useParams();

  if (!stats) {
    return (
      <div className="flex items-center justify-center gap-2 py-2 px-4 text-xs text-slate-500 border-t border-white/5">
        <span>Select an algorithm, draw walls, then click</span>
        <span className="font-semibold text-indigo-400">Visualize</span>
        <span>to animate the search.</span>
      </div>
    );
  }

  const algoName = ALGORITHM_LABELS[stats.algorithmName as AlgorithmType] ?? stats.algorithmName;

  return (
    <div className="flex items-center justify-center gap-6 py-2 px-4 text-xs border-t border-white/5">
      <span className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block"></span>
        <span className="text-slate-400">Algorithm:</span>
        <span className="text-indigo-300 font-medium">{algoName}</span>
      </span>
      <span className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span>
        <span className="text-slate-400">Nodes explored:</span>
        <span className="text-amber-300 font-medium font-mono">{stats.nodesExplored.toLocaleString()}</span>
      </span>
      <span className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
        <span className="text-slate-400">Path length:</span>
        <span className={`font-medium font-mono ${stats.pathFound ? "text-emerald-300" : "text-red-400"}`}>
          {stats.pathFound ? stats.pathLength : "No path found"}
        </span>
      </span>
      <span className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-sky-400 inline-block"></span>
        <span className="text-slate-400">Computed in:</span>
        <span className="text-sky-300 font-medium font-mono">{stats.timeTaken.toFixed(1)} ms</span>
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Navbar
// ─────────────────────────────────────────────
export default function Navbar() {
  const {
    algorithm, setAlgorithm,
    heuristic, setHeuristic,
    mode, setMode,
    terrain, setTerrain,
    speed, setSpeed,
    isRunning,
    resetPath, resetAll,
    applyMaze,
  } = useParams();

  const [selectedMaze, setSelectedMaze] = useState<MazeType>("");

  const algorithmOptions = (Object.keys(ALGORITHM_LABELS) as AlgorithmType[]).map((k) => ({
    value: k,
    label: ALGORITHM_LABELS[k],
  }));

  const heuristicOptions = (Object.keys(HEURISTIC_LABELS) as HeuristicType[]).map((k) => ({
    value: k,
    label: HEURISTIC_LABELS[k],
  }));

  const terrainOptions = (["sand", "water", "forest"] as TerrainType[]).map((k) => ({
    value: k,
    label: TERRAIN_LABELS[k],
  }));

  const mazeOptions = (Object.keys(MAZE_LABELS) as MazeType[]).map((k) => ({
    value: k,
    label: MAZE_LABELS[k],
  }));

  const handleModeToggle = (m: ModeType) => {
    setMode((prev) => (prev === m ? "addWall" : m));
  };

  const handleRun = () => {
    const fn = (window as unknown as Record<string, unknown>).__runAlgorithm as (() => void) | undefined;
    fn?.();
  };

  const handleMazeApply = (type: MazeType) => {
    setSelectedMaze(type);
    if (type) applyMaze(type);
  };

  const description = ALGORITHM_DESCRIPTIONS[algorithm];

  return (
    <header
      style={{ background: "var(--color-bg-nav)", borderBottom: "1px solid var(--color-border)" }}
      className="sticky top-0 z-40 backdrop-blur-sm"
    >
      {/* ── Main toolbar ── */}
      <div className="flex flex-wrap items-center gap-2 px-4 py-2.5">

        {/* Logo */}
        <div className="flex items-center gap-2 mr-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="white">
              <circle cx="3" cy="3" r="2" /><circle cx="13" cy="13" r="2" />
              <path d="M3 3 Q8 0 13 13" stroke="white" strokeWidth="1.5" fill="none" />
            </svg>
          </div>
          <span className="font-bold text-white text-sm tracking-wide hidden sm:block" style={{ fontFamily: "var(--font-mono)" }}>
            PathFind
          </span>
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-white/10 mx-1" />

        {/* Algorithm selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 hidden md:block">Algorithm</span>
          <NavSelect<AlgorithmType>
            id="algorithm-select"
            value={algorithm}
            onChange={setAlgorithm}
            options={algorithmOptions}
            disabled={isRunning}
          />
        </div>

        {/* Heuristic (A* only) */}
        {algorithm === "astar" && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 hidden md:block">Heuristic</span>
            <NavSelect<HeuristicType>
              id="heuristic-select"
              value={heuristic}
              onChange={setHeuristic}
              options={heuristicOptions}
              disabled={isRunning}
            />
          </div>
        )}

        {/* Divider */}
        <div className="w-px h-6 bg-white/10 mx-1" />

        {/* Mode buttons */}
        <div className="flex items-center gap-1">
          <NavButton
            id="mode-setstart"
            active={mode === "setStart"}
            onClick={() => handleModeToggle("setStart")}
            tooltip="Click a cell to move start node"
            disabled={isRunning}
          >
            {Icons.start} <span className="hidden lg:inline">Start</span>
          </NavButton>
          <NavButton
            id="mode-setend"
            active={mode === "setEnd"}
            onClick={() => handleModeToggle("setEnd")}
            tooltip="Click a cell to move end node"
            disabled={isRunning}
          >
            {Icons.end} <span className="hidden lg:inline">End</span>
          </NavButton>
          <NavButton
            id="mode-addwall"
            active={mode === "addWall"}
            onClick={() => handleModeToggle("addWall")}
            tooltip="Click/drag to draw walls"
            disabled={isRunning}
          >
            {Icons.wall} <span className="hidden lg:inline">Wall</span>
          </NavButton>
          <NavButton
            id="mode-erasewall"
            active={mode === "eraseWall"}
            onClick={() => handleModeToggle("eraseWall")}
            tooltip="Click/drag to erase walls"
            disabled={isRunning}
          >
            {Icons.erase} <span className="hidden lg:inline">Erase</span>
          </NavButton>
          <NavButton
            id="mode-addterrain"
            active={mode === "addTerrain"}
            onClick={() => handleModeToggle("addTerrain")}
            tooltip="Paint weighted terrain tiles"
            disabled={isRunning}
          >
            {Icons.terrain} <span className="hidden lg:inline">Terrain</span>
          </NavButton>
        </div>

        {/* Terrain type selector (visible only in addTerrain mode) */}
        {mode === "addTerrain" && (
          <NavSelect<TerrainType>
            id="terrain-select"
            value={terrain}
            onChange={setTerrain}
            options={terrainOptions}
            disabled={isRunning}
          />
        )}

        {/* Divider */}
        <div className="w-px h-6 bg-white/10 mx-1" />

        {/* Maze */}
        <div className="flex items-center gap-2">
          <span className="text-slate-500 hidden md:block">{Icons.maze}</span>
          <NavSelect<MazeType>
            id="maze-select"
            value={selectedMaze}
            onChange={handleMazeApply}
            options={mazeOptions}
            disabled={isRunning}
          />
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-white/10 mx-1" />

        {/* Speed */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 hidden md:block whitespace-nowrap">Speed</span>
          <input
            id="speed-slider"
            type="range"
            min={5}
            max={80}
            step={5}
            value={80 - speed + 5} // invert so right = faster
            onChange={(e) => setSpeed(80 - parseInt(e.target.value) + 5)}
            disabled={isRunning}
            className="w-20 accent-indigo-500 cursor-pointer disabled:opacity-40"
            aria-label="Animation speed"
          />
          <span className="text-xs text-slate-500 hidden md:block whitespace-nowrap">
            {speed <= 10 ? "Fast" : speed <= 30 ? "Medium" : "Slow"}
          </span>
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-white/10 mx-1" />

        {/* Reset buttons */}
        <NavButton
          id="reset-path"
          onClick={() => { resetPath(); }}
          tooltip="Clear visited cells and path"
          disabled={isRunning}
        >
          {Icons.resetPath} <span className="hidden lg:inline">Reset Path</span>
        </NavButton>
        <NavButton
          id="reset-all"
          onClick={() => { resetAll(); }}
          tooltip="Clear entire grid"
          disabled={isRunning}
          variant="danger"
        >
          {Icons.resetAll} <span className="hidden lg:inline">Clear All</span>
        </NavButton>

        {/* Run button */}
        <NavButton
          id="run-btn"
          onClick={handleRun}
          variant={isRunning ? "danger" : "success"}
          tooltip={isRunning ? "Stop animation" : "Run pathfinding algorithm"}
        >
          {isRunning ? <>{Icons.stop} Stop</> : <>{Icons.play} Visualize</>}
        </NavButton>
      </div>

      {/* ── Algorithm description bar ── */}
      <div className="px-4 pb-1.5 text-xs text-slate-500 hidden md:block">
        <span className="text-indigo-400 font-medium">{ALGORITHM_LABELS[algorithm]}:</span>
        {" "}{description}
      </div>

      {/* ── Stats bar ── */}
      <StatsBar />
    </header>
  );
}
=======
.navbar{
    width:100%;  
    height:min(20vh , 100px);
    background:black;
}

.navbar .selected {
    box-shadow: rgb(204, 219, 232) 3px 3px 6px 0px inset, rgba(255, 255, 255,     0.5) -3px -3px 6px 1px inset;
}
>>>>>>> 2417618345bc5f1b1ce8babf71c6280d864ddcc4
