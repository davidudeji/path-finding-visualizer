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
  );
};
