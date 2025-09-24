// scripts/fix_graph.js
// Usage: node scripts/fix_graph.js public/data/agents_graph.json

import fs from "fs";
import path from "path";

const inputPath = process.argv[2] || "public/data/agents_graph.json";
if (!fs.existsSync(inputPath)) {
console.error("File not found:", inputPath);
 process.exit(1);
}
const raw = fs.readFileSync(inputPath, "utf8");
const g = JSON.parse(raw);

// Maps & helpers
const nodeById = new Map(g.nodes.map(n => [n.id, n]));
const edgeKey = (s,t) => `${s}->${t}`;
const haveEdge = new Set(g.edges.map(e => edgeKey(e.source, e.target)));
const addNode = (n) => { if (!nodeById.has(n.id)) { g.nodes.push(n); nodeById.set(n.id, n); } };
const addEdge = (s,t) => { const k=edgeKey(s,t); if(!haveEdge.has(k)){ g.edges.push({ id:k, source:s, target:t }); haveEdge.add(k); } };
const canon = v => (typeof v === "string" ? v.normalize("NFKC").trim().replace(/\s+/g," ") : (v ?? ""));

const catId = (flow, phase, wf, cat) => `category::${flow}::${phase}::${wf}::${cat || "Uncategorized"}`;
const wfId  = (flow, phase, wf)     => `workflow::${flow}::${phase}::${wf}`;

let elevated = 0, createdCats = 0, removedWF2Agent = 0;

// Canonicalize all strings and fix nodes
for (const n of g.nodes) {
 // normalize data strings to avoid facet mismatches
 n.data = n.data || {};
 n.data.flow           = canon(n.data.flow);
 n.data.phase          = canon(n.data.phase);
 n.data.workflow       = canon(n.data.workflow);
n.data.category       = canon(n.data.category) || "Uncategorized";
 n.data.class          = canon(n.data.class);
n.data.reasoning      = canon(n.data.reasoning);
n.data.description    = canon(n.data.description);
 n.data.role           = canon(n.data.role);
n.data.underlying_data= canon(n.data.underlying_data);
n.data.impact         = canon(n.data.impact);
}

// Ensure every AGENT is level 4 and sits under a level-3 CATEGORY node
for (const n of g.nodes) {
 if (n.type !== "agent") continue;

 const { flow, phase, workflow, category } = n.data;

 // Elevate to level 4 if not already
 if (n.level !== 4) { n.level = 4; elevated++; }

 // Create a Category node if missing
 const cId = catId(flow, phase, workflow, category);
 if (!nodeById.has(cId)) {
   addNode({
     id: cId,
     label: category || "Uncategorized",
     type: "group",
     level: 3,
     data: { flow, phase, workflow, category: category || "Uncategorized" }
   });
   createdCats++;
 }

 // Ensure edges Workflow -> Category -> Agent
 const wId = wfId(flow, phase, workflow);
 addEdge(wId, cId);
 addEdge(cId, n.id);
}

// Remove any direct Workflow -> Agent edges (cleanup)
g.edges = g.edges.filter(e => {
 const s = nodeById.get(e.source);
 const t = nodeById.get(e.target);
 const isWF2Agent = s?.id?.startsWith("workflow::") && t?.type === "agent";
 if (isWF2Agent) { removedWF2Agent++; return false; }
 return true;
});

// Sort (optional)
g.nodes.sort((a,b)=>(a.level??0)-(b.level??0));

fs.writeFileSync(inputPath, JSON.stringify(g, null, 2));
console.log(`Graph fixed:
- Agents elevated to level 4: ${elevated}
- New category nodes created: ${createdCats}
- Removed direct workflow->agent edges: ${removedWF2Agent}
- Nodes: ${g.nodes.length}, Edges: ${g.edges.length}
Saved: ${path.resolve(inputPath)}
`);
