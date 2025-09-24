import * as XLSX from "xlsx";
import type { GraphData, GNode } from "./types";

export const norm = (v:any) => (v==null ? "" : String(v).trim());
const fid=(f:string)=>`flow::${f}`;
const pid=(f:string,p:string)=>`phase::${f}::${p}`;
const wid=(f:string,p:string,w:string)=>`workflow::${f}::${p}::${w}`;
const cid=(f:string,p:string,w:string,c:string)=>`category::${f}::${p}::${w}::${c}`;
const aid=(f:string,p:string,w:string,a:string)=>`agent::${f}::${p}::${w}::${a}`;

export function fromExcelToGraph(buf:ArrayBuffer): GraphData {
  const wb = XLSX.read(buf, { type:"array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<any>(ws, { defval:"" });

  const nodes = new Map<string,GNode>();
  const edges: {id:string;source:string;target:string}[] = [];
  const add=(id:string,label:string,level:0|1|2|3|4,type:"group"|"agent",data:any)=>{
    if(!nodes.has(id)) nodes.set(id, { id, label, level, type, data });
  };
  const edge=(s:string,t:string)=>{ const id=`${s}->${t}`; if(!edges.find(e=>e.id===id)) edges.push({ id, source:s, target:t }); };

  for(const r of rows){
    const flow = norm(r["Flow"]) || "Unspecified Flow";
    const phase = norm(r["Phase"]) || "Unspecified Phase";
    const wf   = norm(r["Workflow/ Activities"] ?? r["Workflow"] ?? r["Workflow / Activities"]) || "Unspecified Workflow";
    const cat  = norm(r["Agent Category"] ?? r["Category"]) || "Uncategorized";
    const agent= norm(r["Agent Name"] ?? r["Agent"]) || "Unnamed Agent";
    const klass= norm(r["Class"] ?? r["Agent Category (Role/ Process/ Systems)"]);
    const reasoning   = norm(r["Reason"] ?? r["Reasoning"]);
    const description = norm(r["Brief Description"] ?? r["Description"]);
    const role        = norm(r["Role"]);
    const underlying  = norm(r["Underlying Data"] ?? r["Data"]);
    const impact      = norm(r["Impact"]);

    const f=fid(flow), p=pid(flow,phase), w=wid(flow,phase,wf), c=cid(flow,phase,wf,cat), a=aid(flow,phase,wf,agent);

    add(f, flow, 0, "group", { flow });
    add(p, phase, 1, "group", { flow, phase });
    add(w, wf,   2, "group", { flow, phase, workflow:wf });
    add(c, cat,  3, "group", { flow, phase, workflow:wf, category:cat });

    const data:any = { flow, phase, workflow:wf, category:cat, class:klass, reasoning, description, role, underlying_data:underlying };
    if (impact) data.impact = impact;
    add(a, agent, 4, "agent", data);

    edge(f,p); edge(p,w); edge(w,c); edge(c,a);
  }

  return { nodes:[...nodes.values()], edges };
}

import type { GraphData, GNode } from "./types";

const isAgent = (n: GNode) => n.type === "agent" || n.level === 4;
const matchVal = (v?: string, sel?: string[]) => !sel?.length || (v ? sel.includes(v) : false);

export function subgraphByFilters(
 graph: GraphData,
 filters: { flows: string[]; phases: string[]; workflows: string[]; categories: string[] }
) {
 const parentsByChild = new Map<string, string[]>();
 for (const e of graph.edges) {
   if (!parentsByChild.has(e.target)) parentsByChild.set(e.target, []);
  parentsByChild.get(e.target)!.push(e.source);
 }

 const pass = (d: any) =>
  matchVal(d.flow, filters.flows) &&
   matchVal(d.phase, filters.phases) &&
  matchVal(d.workflow, filters.workflows) &&
  matchVal(d.category, filters.categories);

 // 1) Seed: matching AGENTS only
 const keep = new Set<string>();
 for (const n of graph.nodes) if (isAgent(n) && pass(n.data || {})) keep.add(n.id);

 // 2) Pull in ancestors so Flow→Phase→Workflow→Category→Agent path stays
 const stack = [...keep];
 while (stack.length) {
   const child = stack.pop()!;
   const parents = parentsByChild.get(child) || [];
   for (const p of parents) if (!keep.has(p)) { keep.add(p); stack.push(p); }
 }

 const nodes = graph.nodes.filter(n => keep.has(n.id));
 const edges = graph.edges.filter(e => keep.has(e.source) && keep.has(e.target));
 return { nodes, edges };
}

// FACET OPTIONS & COUNTS derived from AGENTS (prevents drift)
export function getCrossOptions(
 graph: GraphData,
 filters: { flows: string[]; phases: string[]; workflows: string[]; categories: string[] }
) {
 const agents = graph.nodes.filter(isAgent).map(n => n.data || {});
 const passExcept = (d:any, exc:"flow"|"phase"|"workflow"|"category") => {
   const ok = (k:"flow"|"phase"|"workflow"|"category", sel:string[]) => !sel.length || sel.includes(d[k] || "");
   return (exc==="flow" || ok("flow",filters.flows)) &&
         (exc==="phase" || ok("phase",filters.phases)) &&
         (exc==="workflow" || ok("workflow",filters.workflows)) &&
         (exc==="category" || ok("category",filters.categories));
 };
 const uniq = (a:string[]) => [...new Set(a.filter(Boolean))].sort((x,y)=>x.localeCompare(y));
 return {
   flows:     uniq(agents.filter(d => passExcept(d,"flow")).map(d => d.flow)),
   phases:    uniq(agents.filter(d => passExcept(d,"phase")).map(d => d.phase)),
   workflows: uniq(agents.filter(d => passExcept(d,"workflow")).map(d => d.workflow)),
  categories:uniq(agents.filter(d => passExcept(d,"category")).map(d => d.category)),
 };
}

export function getFacetCounts(
 graph: GraphData,
 filters: { flows: string[]; phases: string[]; workflows: string[]; categories: string[] }
) {
 const agents = graph.nodes.filter(isAgent).map(n => n.data || {});
 const inc = (o:any,k:string) => { if(!k) return; o[k]=(o[k]||0)+1; };
 const counts = { flows:{}, phases:{}, workflows:{}, categories:{} } as any;

 for (const d of agents) {
   // flows
   if ((!filters.phases.length || filters.phases.includes(d.phase||"")) &&
       (!filters.workflows.length || filters.workflows.includes(d.workflow||"")) &&
      (!filters.categories.length || filters.categories.includes(d.category||""))) inc(counts.flows, d.flow||"");

   // phases
   if ((!filters.flows.length || filters.flows.includes(d.flow||"")) &&
      (!filters.workflows.length || filters.workflows.includes(d.workflow||"")) &&
      (!filters.categories.length || filters.categories.includes(d.category||""))) inc(counts.phases, d.phase||"");

   // workflows
   if ((!filters.flows.length || filters.flows.includes(d.flow||"")) &&
      (!filters.phases.length || filters.phases.includes(d.phase||"")) &&
      (!filters.categories.length || filters.categories.includes(d.category||""))) inc(counts.workflows, d.workflow||"");

   // categories
   if ((!filters.flows.length || filters.flows.includes(d.flow||"")) &&
      (!filters.phases.length || filters.phases.includes(d.phase||"")) &&
      (!filters.workflows.length || filters.workflows.includes(d.workflow||""))) inc(counts.categories, d.category||"");
 }
 return counts;
}
