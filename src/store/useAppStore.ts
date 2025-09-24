import { create } from "zustand";
import type { GraphData } from "@/graph/types";
import { subgraphByFilters, getCrossOptions, getFacetCounts } from "@/graph/transform";

type Filters = { flows:string[]; phases:string[]; workflows:string[]; categories:string[] };

interface AppState {
 graphData: GraphData | null;
 filteredGraphData: GraphData | null;
 filters: Filters;
 options: { flows:string[]; phases:string[]; workflows:string[]; categories:string[] };
 counts:  { flows:Record<string,number>; phases:Record<string,number>; workflows:Record<string,number>; categories:Record<string,number> };
 selectedNodeId?: string;
 theme: "light"|"dark";
 
 // NEW:
 fitViewTick: number;
 bumpFit: () => void;
 
 setGraph: (g:GraphData)=>void;
 applyFilters: ()=>void;
 setFilters: (f:Partial<Filters>)=>void;
 clearAllFilters: ()=>void;
 selectNode: (id?:string)=>void;
 toggleTheme: ()=>void;
}

export const useAppStore = create<AppState>((set,get)=>({
 graphData:null, filteredGraphData:null,
 filters:{ flows:[], phases:[], workflows:[], categories:[] },
 options:{ flows:[], phases:[], workflows:[], categories:[] },
 counts:{ flows:{}, phases:{}, workflows:{}, categories:{} },
theme:"dark",
 
 // NEW:
 fitViewTick: 0,
 bumpFit: () => set(s => ({ fitViewTick: s.fitViewTick + 1 })),
 
 setGraph:(g)=> {
   const filters = { flows:[], phases:[], workflows:[], categories:[] };
   set({
     graphData:g, filteredGraphData:g, filters,
    options:getCrossOptions(g,filters),
    counts:getFacetCounts(g,filters),
    selectedNodeId:undefined
   });
   // NEW: after graph updates, request a fit
  get().bumpFit();
 },
 
applyFilters:()=> {
   const { graphData, filters } = get(); if(!graphData) return;
   const sub = subgraphByFilters(graphData, filters);
   set({ filteredGraphData:sub, options:getCrossOptions(graphData,filters), counts:getFacetCounts(graphData,filters) });
   // NEW: after filters applied, request a fit
  get().bumpFit();
 },
 
setFilters:(f)=>{ set(s=>({ filters:{...s.filters, ...f}, selectedNodeId:undefined })); get().applyFilters(); },
clearAllFilters:()=>{ set({ filters:{ flows:[], phases:[], workflows:[], categories:[] }, selectedNodeId:undefined }); get().applyFilters(); },
 selectNode:(id)=> set({ selectedNodeId:id }),
 toggleTheme:()=> set(s=>({ theme:s.theme==="light"?"dark":"light" }))
}));
