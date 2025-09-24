export type NodeType = "group" | "agent";  // groups (levels 0..3), agent at level 4

export interface AgentData {
  flow?: string;
  phase?: string;
  workflow?: string;
  category?: string;   // Level-3 label + filter facet
  class?: string;      // Role/Process/System
  reasoning?: string;
  description?: string;
  role?: string;
  underlying_data?: string;
  impact?: string;     // optional
}

export interface GNode {
  id: string;
  label: string;
  type: NodeType;
  level: 0 | 1 | 2 | 3 | 4;  // 0 Flow, 1 Phase, 2 Workflow, 3 Category, 4 Agent
  position?: { x:number; y:number };
  data?: AgentData;
}

export interface GEdge { id: string; source: string; target: string; }
export interface GraphData { nodes: GNode[]; edges: GEdge[]; }
