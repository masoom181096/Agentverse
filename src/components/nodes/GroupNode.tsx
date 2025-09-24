import { Handle, Position } from "reactflow";
export default function GroupNode({ data }: any) {
  const n = data?.node;
  return (
    <div className="rounded-2xl border px-3 py-2 shadow-sm bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-700">
      <div className="text-xs text-slate-500 dark:text-slate-300 mb-1">Level {n?.level}</div>
      <div className="font-semibold leading-snug">{n?.label}</div>
      <Handle type="target" position={Position.Top}/>
      <Handle type="source" position={Position.Bottom}/>
    </div>
  );
}
