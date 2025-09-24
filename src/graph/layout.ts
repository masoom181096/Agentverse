import dagre from "@dagrejs/dagre";
import type { GraphData } from "./types";

const NODE_W = 260;
const H = (lvl:number) => (lvl >= 4 ? 72 : lvl === 3 ? 78 : 84);

export function layoutGraph(graph: GraphData): GraphData {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir:"TB", ranksep:140, nodesep:90, edgesep:40, marginx:40, marginy:40 });
  g.setDefaultEdgeLabel(() => ({}));

  for (const n of graph.nodes) g.setNode(n.id, { width: NODE_W, height: H(n.level) });
  for (const e of graph.edges) g.setEdge(e.source, e.target);
  dagre.layout(g);

  return {
    nodes: graph.nodes.map(n => {
      const p:any = g.node(n.id) || { x: 0, y: 0 };
      return { ...n, position: { x: p.x, y: p.y } };
    }),
    edges: graph.edges,
  };
}
