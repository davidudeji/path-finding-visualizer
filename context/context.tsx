import {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { createStartingGrid } from "../utils/startingGrid";
import type { GridType } from "../utils/types";

type ParamsContextValue = {
  algo: string;
  setAlgo: Dispatch<SetStateAction<string>>;
  run: boolean;
  setRun: Dispatch<SetStateAction<boolean>>;
  grid: GridType;
  setGrid: Dispatch<SetStateAction<GridType>>;
  editing: boolean;
  setEditing: Dispatch<SetStateAction<boolean>>;
  setRes: Dispatch<SetStateAction<boolean>>;
  start: { current: { x: number; y: number } };
  end: { current: { x: number; y: number } };
};

const ParamsContext = createContext<ParamsContextValue | undefined>(undefined);
console.log(ParamsContext);

export function useParams() {
  const context = useContext(ParamsContext);

  if (!context) {
    throw new Error("useParams must be used within a ParamsProvider");
  }

  return context;
}

export function ParamsProvider({ children }: { children: ReactNode }) {
  const [algo, setAlgo] = useState("");
  const [run, setRun] = useState(false);
  const [grid, setGrid] = useState<GridType>(() =>
    createStartingGrid({
      rows: 50,
      cols: 25,
      startCoord: [0, 0],
      targetCoord: [49, 24],
    }),
  );
  const [editing, setEditing] = useState(false);
  const [, setRes] = useState(false);
  const start = useRef({ x: 25, y: 12 });
  const end = useRef({ x: 48, y: 23 });

  const value = useMemo<ParamsContextValue>(
    () => ({
      algo,
      setAlgo,
      run,
      setRun,
      grid,
      setGrid,
      editing,
      setEditing,
      setRes,
      start,
      end,
    }),
    [algo, run, grid, editing],
  );

  return (
    <ParamsContext.Provider value={value}>{children}</ParamsContext.Provider>
  );
}
