import type { GraphData, GNode } from "./types";

const canon = (v:any) => (typeof v === "string" ? v.normalize("NFKC").trim().replace(/\s+/g," ") : (v ?? ""));

export function normalizeLevels(g: GraphData): GraphData {
 const fix = (n: GNode): GNode => {
   // coerce leaves to agent level-4 if someone ships a sloppy JSON
   let type = n.type;
   let level = n.level as any;

   if (type === "agent" || level === 4) { type = "agent"; level = 4; }
   else if (type !== "agent" && (level === undefined || level === null)) {
     const id = n.id || "";
     level =
      id.startsWith("flow::") ? 0 :
      id.startsWith("phase::") ? 1 :
      id.startsWith("workflow::") ? 2 :
      id.startsWith("category::") ? 3 : 3;
   }

   const d = n.data || {};
   const data = {
     ...d,
     flow: canon(d.flow),
     phase: canon(d.phase),
     workflow: canon(d.workflow),
     category: canon(d.category) || "Uncategorized",
     class: canon(d.class),
     reasoning: canon(d.reasoning),
     description: canon(d.description),
     role: canon(d.role),
    underlying_data: canon(d.underlying_data),
     impact: canon(d.impact),
   };

   return { ...n, type: type as any, level: level as any, data };
 };

 return { nodes: g.nodes.map(fix), edges: g.edges };
}
