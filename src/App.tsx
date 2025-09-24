import { useEffect, useState } from "react";
import { loadGraphStrict } from "@/lib/data";
import { useAppStore } from "@/store/useAppStore";
import Topbar from "@/components/Topbar";
import SidebarFilters from "@/components/SidebarFilters";
import GraphCanvas from "@/components/GraphCanvas";
import InspectorPanel from "@/components/Inspector";

export default function App(){
  const setGraph = useAppStore(s=>s.setGraph);
  const applyFilters = useAppStore(s=>s.applyFilters);
  const theme = useAppStore(s=>s.theme);
  const [err,setErr] = useState<string|null>(null);

  useEffect(()=>{ document.documentElement.classList.toggle("dark", theme==="dark"); },[theme]);

  useEffect(()=>{ (async()=>{
    try{ const g=await loadGraphStrict(); setGraph(g); applyFilters(); setErr(null); }
    catch(e:any){ setErr(e?.message ?? String(e)); }
  })(); },[setGraph, applyFilters]);

  return (
    <div className="h-full flex flex-col">
      <Topbar/>
      {err && <div className="px-4 py-2 text-sm bg-red-50 text-red-700 border-b border-red-200">
        Failed to load <code>agents_graph.json</code>: {err}
      </div>}
       <div className="grid grid-cols-[360px_minmax(0,1fr)_380px] gap-4 px-4 py-4">
        <SidebarFilters/>
        <GraphCanvas/>
        <div className="w-[360px] shrink-0 border-l border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-950/30">
          <InspectorPanel />
        </div>
       </div>
    </div>
  );
}
