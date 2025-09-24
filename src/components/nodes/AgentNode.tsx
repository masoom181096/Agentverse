import { Handle, Position } from "reactflow";
export default function AgentNode({ data }: any) {
  const n = data?.node;
  const cat = n?.data?.category || "Agent";
  return (
    <div className="rounded-xl border px-3 py-2 shadow-sm bg-blue-50 text-slate-900 border-blue-200
                   dark:bg-blue-900/30 dark:text-slate-100 dark:border-blue-800">
      <div className="text-[11px] text-slate-600 dark:text-slate-300 mb-0.5">{cat}</div>
      <div className="font-semibold leading-snug">{n?.label}</div>
      <Handle type="target" position={Position.Top}/>
    </div>
  );
}
