import { Button } from "@/components/ui/Button";
import { useAppStore } from "@/store/useAppStore";
import { fromExcelToGraph } from "@/graph/transform";
import { normalizeLevels } from "@/graph/normalize";
import { loadGraphStrict } from "@/lib/data";
import { APP_BRAND } from "@/config";
import { RefreshCw, FileUp, Sun } from "lucide-react";

export default function Topbar(){
  const setGraph = useAppStore(s=>s.setGraph);
  const applyFilters = useAppStore(s=>s.applyFilters);
  const toggleTheme = useAppStore(s=>s.toggleTheme);

  const reload = async () => { const g = await loadGraphStrict(); setGraph(g); applyFilters(); };
  const importExcel = async (file: File) => { const buf = await file.arrayBuffer(); const g = normalizeLevels(fromExcelToGraph(buf)); setGraph(g); applyFilters(); };
  const onExcelPick = () => { const i=document.createElement("input"); i.type="file"; i.accept=".xlsx,.xls"; i.onchange=()=>{const f=i.files?.[0]; if(f) importExcel(f)}; i.click(); };

  return (
    <header className="flex items-center justify-between px-4 py-2 border-b border-slate-200 dark:border-slate-800 bg-slate-900/70 text-slate-100">
      <div className="font-semibold">{APP_BRAND}</div>
      <div className="flex items-center gap-2">
        <Button onClick={reload}><RefreshCw className="inline w-4 h-4 mr-1"/>Reload</Button>
        <Button onClick={onExcelPick}><FileUp className="inline w-4 h-4 mr-1"/>Import Excel</Button>
        <Button onClick={toggleTheme}><Sun className="inline w-4 h-4"/></Button>
      </div>
    </header>
  );
}
