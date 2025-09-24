import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactFlow, {
 Background, BackgroundVariant, Controls, MiniMap,
 Node as RFNode, Edge as RFEdge,
 useReactFlow, getRectOfNodes, getTransformForBounds
} from "reactflow";
import "reactflow/dist/style.css";
import { layoutGraph } from "@/graph/layout";
import { useAppStore } from "@/store/useAppStore";
import { GNode } from "@/graph/types";
import GroupNode from "./nodes/GroupNode";
import AgentNode from "./nodes/AgentNode";
 
const nodeTypes = { group: GroupNode, agent: AgentNode };
const toRF = (nodes: GNode[]): RFNode[] =>
 nodes.map(n => ({
   id: n.id,
   type: n.type,
   data: { node: n },
   position: n.position || { x: 0, y: 0 },
   selectable: true
 }));
 
export default function GraphCanvas() {
 const filtered = useAppStore(s => s.filteredGraphData);
 const fitTick  = useAppStore(s => s.fitViewTick); // triggers after load/filter
 const [inst, setInst] = useState<any>(null);
 const wrapperRef = useRef<HTMLDivElement>(null);
 
 const laid = useMemo(() => {
   if (!filtered || !filtered.nodes.length) return { nodes: [], edges: [] as RFEdge[] };
   const g = layoutGraph(filtered);
   return {
     nodes: toRF(g.nodes),
     edges: g.edges.map(e => ({ id: e.id, source: e.source, target: e.target })),
   };
 }, [filtered]);
 
 const centerOnGraph = useCallback(async () => {
   if (!inst) return;
   
   // Wait until React Flow measures node dimensions (width/height)
   await new Promise(requestAnimationFrame);
   await new Promise(requestAnimationFrame);
 
   if (!laid.nodes.length) {
     // If nothing to fit, reset to a sane center to avoid drifting
     inst.setCenter(0, 0, { zoom: 1, duration: 250 });
     return;
   }
 
   // Use the instance to fit the view
   try {
     inst.fitView({ padding: 0.2, duration: 400 });
   } catch (_) {
     // Fallback: just center the view
     inst.setCenter(0, 0, { zoom: 1, duration: 400 });
   }
 }, [inst, laid.nodes.length]);
 
 // Fit on first mount + whenever the laid-out node list changes
 useEffect(() => {
   if (inst && laid.nodes.length) centerOnGraph();
 }, [inst, laid.nodes.length, centerOnGraph]);
 
 // Fit whenever filters/data request it
 useEffect(() => {
   if (!inst) return;
  centerOnGraph();
 }, [fitTick, inst, centerOnGraph]);
 
 return (
   <div ref={wrapperRef} className="h-full min-h-[70vh] w-full">
     <ReactFlow
      nodeTypes={nodeTypes}
      nodes={laid.nodes}
      edges={laid.edges}
      minZoom={0.1}
      maxZoom={1.5}
      onNodeClick={(_, n) => {
         const node = (n?.data as any)?.node;
         if (node?.type === "agent" || node?.level === 4) {
          useAppStore.getState().selectNode(node.id);
         }
       }}
      onInit={setInst}
       fitView
      proOptions={{ hideAttribution: true }}
     >
       <MiniMap pannable zoomable />
      <Controls />
      <Background variant={BackgroundVariant.Dots} gap={18} size={1} color="#cbd5e1" />
    </ReactFlow>
   </div>
 );
}
