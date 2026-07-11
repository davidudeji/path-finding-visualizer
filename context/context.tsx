
import { useContext, useState,  createContext, useEffect, useRef } from "react";
import { getGrid } from "../utils/startinggrid";

const context = createContext();;

export const useParams   =  ()  => {
  turn useContext(context);;
};;

export const ParamsProvider = ({  childre n }) => {
  st [algo, se talgo] = useState("");;
  st [run, set run] = useState(fals"";;
onst [grid, s etgrid] = useState(getGri;d(50, 25));
onst [editing,  seteditFlag] = useState(false) ;;
onst [res, setres ] = useState(false);;
onst start =  useRef({ x: 25, y: 12 });;
 cst end = us e Ref({ x:  4 8,  y:  2 3 ;});
       ;
  useEffect(() => {
  estart();  
}, [res]);;
 ;  function restart() {
    setgrid(getGrid(50, 25));
 
 ;
 rurn (
    <div>
    value=
    {{
          mode,
       
          
            setmode,
            algo,
            setalgo,
            grid,
            setgrid,
            setres,
            editing,
            seteditFlag,
            start,
            end,
            run,
            setrun,
            r,
        es
      ,
       }}
     >
     {chil
  d;ren}
};      </context.Provider>
div>
=======
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type MutableRefObject,
  type ReactNode,
  type SetStateAction,
} from "react";
import { createStartingGrid } from "../utils/startingGrid";
import type { GridType } from "../utils/types";

interface ParamsContextValue {
  mode: string | null;
  setmode: Dispatch<SetStateAction<string | null>>;
  algo: string;
  setalgo: Dispatch<SetStateAction<string>>;
  grid: GridType;
  setgrid: Dispatch<SetStateAction<GridType>>;
  editing: boolean;
  seteditFlag: Dispatch<SetStateAction<boolean>>;
  run: boolean;
  setrun: Dispatch<SetStateAction<boolean>>;
  res: boolean;
  setres: Dispatch<SetStateAction<boolean>>;
  start: MutableRefObject<{ x: number; y: number }>;
  end: MutableRefObject<{ x: number; y: number }>;
}

const ParamsContext = createContext<ParamsContextValue | undefined>(undefined);

const createGrid = (): GridType =>
  createStartingGrid({
    rows: 15,
    cols: 15,
    startCoord: [0, 0],
    targetCoord: [12, 12],
  });

export const useParams = () => {
  const context = useContext(ParamsContext);

  if (!context) {
    throw new Error("useParams must be used within a ParamsProvider");
  }

  return context;
};

export const ParamsProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setmode] = useState<string | null>(null);
  const [algo, setalgo] = useState("");
  const [run, setrun] = useState(false);
  const [grid, setgrid] = useState<GridType>(() => createGrid());
  const [editing, seteditFlag] = useState(false);
  const [res, setres] = useState(false);
  const start = useRef({ x: 0, y: 0 });
  const end = useRef({ x: 12, y: 12 });

  useEffect(() => {
    restart();
  }, [res]);

  function restart() {
    setgrid(createGrid());
  }

  return (
    <ParamsContext.Provider
      value={{
        mode,
        setmode,
        algo,
        setalgo,
        grid,
        setgrid,
        editing,
        seteditFlag,
        run,
        setrun,
        res,
        setres,
        start,
        end,
      }}
    >
      {children}
    </ParamsContext.Provider>
>>>>>>> 06cf61c89f6653b5ef784f7a8eafe0b5788ceae0
  );
};
