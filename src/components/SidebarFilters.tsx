import { useMemo, useState } from "react";
import { useAppStore } from "@/store/useAppStore";

function Facet({ label, options, counts, selected, onChange }:{
  label:string; options:string[]; counts:Record<string,number>; selected:string[]; onChange:(v:string[])=>void;
}){
  const [q,setQ]=useState("");
  const visible = useMemo(()=> options.filter(o=>o.toLowerCase().includes(q.toLowerCase())), [q,options]);
  const toggle = (v:string)=> selected.includes(v) ? onChange(selected.filter(x=>x!==v)) : onChange([...selected,v]);

  return (
    <div className="card p-3 space-y-2">
      <div className="section-title">{label}</div>
      <input value={q} onChange={e=>setQ(e.target.value)} placeholder={`Search ${label.toLowerCase()}...`}
            className="w-full rounded-md border px-2 py-1 dark:bg-transparent"/>
      <div className="max-h-44 overflow-auto space-y-1">
       {visible.map(v=>(
          <button key={v} className={`w-full text-left px-2 py-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 ${selected.includes(v)?"bg-blue-600/10 ring-1 ring-blue-500":""}`} onClick={()=>toggle(v)}>
            <span className="font-medium">{v}</span>
            <span className="text-xs opacity-60 ml-2">{counts?.[v] ?? 0}</span>
         </button>
        ))}
      </div>
     {selected.length>0 && (
        <div className="flex flex-wrap gap-2 pt-1">
         {selected.map(v=>(
            <span key={v} className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
             {v}<button onClick={()=>toggle(v)} className="opacity-70 hover:opacity-100">✕</button>
           </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SidebarFilters(){
  const { filters, options, counts, setFilters, clearAllFilters } = useAppStore();
  return (
    <aside className="p-4 space-y-4 sticky top-0 self-start h-screen overflow-y-auto">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold">Filters</h2>
        <button className="btn-ghost btn" onClick={clearAllFilters}>Clear all</button>
      </div>

      <Facet label="Flow"     options={options.flows}     counts={counts.flows}      selected={filters.flows}      onChange={(v)=>setFilters({ flows:v })}/>
      <Facet label="Phase"    options={options.phases}    counts={counts.phases}     selected={filters.phases}     onChange={(v)=>setFilters({ phases:v })}/>
      <Facet label="Workflow" options={options.workflows} counts={counts.workflows}  selected={filters.workflows}  onChange={(v)=>setFilters({ workflows:v })}/>
      <Facet label="Category" options={options.categories} counts={counts.categories} selected={filters.categories} onChange={(v)=>setFilters({ categories:v })}/>
    </aside>
  );
}
