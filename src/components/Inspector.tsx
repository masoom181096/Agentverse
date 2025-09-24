import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
 
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
 Tooltip,
 TooltipProvider,
 TooltipTrigger,
 TooltipContent,
} from "@/components/ui/tooltip";
import {
 Info,
 Copy,
 Check,
 FileText,
 Lightbulb,
 UserCheck,
 Database,
 Sparkles,
 Tag,
 ChevronRight,
} from "lucide-react";
 
// ------- Small helpers -------
 
function Row({
 icon,
 label,
 children,
 accent = "from-blue-500/20 to-blue-500/0",
 copyableText,
}: {
 icon: React.ReactNode;
 label: string;
 children?: React.ReactNode;
 accent?: string;
 copyableText?: string;
}) {
 const [copied, setCopied] = useState(false);
 
 const copy = async () => {
   if (!copyableText) return;
   try {
     await navigator.clipboard.writeText(copyableText);
    setCopied(true);
     setTimeout(() => setCopied(false), 900);
   } catch {}
 };
 
 return (
   <Card className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm border border-slate-200/70 dark:border-slate-800/70 shadow-sm relative overflow-hidden">
     <div
      className={`pointer-events-none absolute inset-0 bg-gradient-to-r ${accent} opacity-80`}
       aria-hidden
     />
    <CardContent className="relative p-4">
       <div className="flex items-start justify-between gap-3">
         <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
          <span className="shrink-0">{icon}</span>
          <span className="text-[11px] font-semibold tracking-wider uppercase">
            {label}
          </span>
        </div>
        {copyableText ? (
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={copy}
                  className="h-7 w-7 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent className="text-xs">Copy</TooltipContent>
            </Tooltip>
          </TooltipProvider>
         ) : null}
      </div>
 
       <div className="mt-2 text-sm leading-6 text-slate-800 dark:text-slate-100 whitespace-pre-wrap">
        {children}
      </div>
    </CardContent>
   </Card>
 );
}
 
function Breadcrumb({ parts }: { parts: string[] }) {
 return (
   <div className="flex flex-wrap items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
     {parts
      .filter(Boolean)
       .map((p, i) => (
         <span key={i} className="flex items-center gap-1">
          <span>{p}</span>
           {i < parts.length - 1 && <ChevronRight className="h-3.5 w-3.5 opacity-70" />}
        </span>
       ))}
   </div>
 );
}
 
function Pill({ children }: { children: React.ReactNode }) {
 return (
   <Badge
    variant="secondary"
    className="bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700"
   >
     {children}
   </Badge>
 );
}
 
// ------- Main Inspector -------
 
export default function InspectorPanel() {
 const selectedId = useAppStore((s) => s.selectedNodeId);
 const graph = useAppStore((s) => s.graphData);
 
 const node = useMemo(() => {
   if (!selectedId || !graph) return undefined;
   return graph.nodes.find((n) => n.id === selectedId);
 }, [selectedId, graph]);
 
 if (!node || (node.level !== 4 && node.type !== "agent")) {
   return (
     <div className="h-full w-full flex items-center justify-center text-sm text-slate-500 dark:text-slate-400">
       Select a node to view details
     </div>
   );
 }
 
 const d = node.data || {};
 const breadcrumb = [d.flow, d.phase, d.workflow, d.category];
 
 // Build a short "copy all" payload
 const copyAll =
   `Agent: ${node.label}\n` +
   `Category: ${d.category}\n` +
   `Class: ${d.class}\n\n` +
   (d.reasoning ? `Reasoning:\n${d.reasoning}\n\n` : "") +
   (d.description ? `Description:\n${d.description}\n\n` : "") +
   (d.role ? `Role:\n${d.role}\n\n` : "") +
  (d.underlying_data ? `Underlying Data:\n${d.underlying_data}\n\n` : "") +
   (d.impact ? `Impact:\n${d.impact}\n` : "");
 
 return (
   <div className="h-full w-full p-4 lg:p-5 overflow-y-auto bg-white/50 dark:bg-slate-950/30">
    <AnimatePresence mode="popLayout">
      <motion.div
        key={node.id}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
         exit={{ opacity: 0, y: 6 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className="space-y-4"
       >
         {/* Header */}
         <div className="space-y-2">
          <Breadcrumb parts={breadcrumb} />
 
           <div className="flex items-start justify-between gap-2">
            <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
              {node.label}
            </h2>
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={async () => {
                      try {
                         await navigator.clipboard.writeText(copyAll);
                      } catch {}
                    }}
                    className="gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Copy All
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="text-xs">Copy all details</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
 
           <div className="flex flex-wrap gap-2">
            {d.category ? (
              <Pill>
                <Tag className="h-3.5 w-3.5 mr-1.5" />
                {d.category}
              </Pill>
             ) : null}
            {d.class ? <Pill>{d.class}</Pill> : null}
          </div>
        </div>
 
        <Separator className="bg-slate-200 dark:bg-slate-800" />
 
         {/* Sections */}
        {d.reasoning ? (
           <Row
            icon={<Lightbulb className="h-4 w-4" />}
            label="Reasoning"
            copyableText={d.reasoning}
            accent="from-amber-500/18 to-transparent"
           >
            {d.reasoning}
          </Row>
         ) : null}
 
        {d.description ? (
           <Row
            icon={<Info className="h-4 w-4" />}
            label="Description"
            copyableText={d.description}
            accent="from-blue-500/16 to-transparent"
           >
            {d.description}
          </Row>
         ) : null}
 
         {d.role ? (
           <Row
            icon={<UserCheck className="h-4 w-4" />}
            label="Role"
            copyableText={d.role}
            accent="from-emerald-500/16 to-transparent"
           >
            {d.role}
          </Row>
         ) : null}
 
        {d.underlying_data ? (
           <Row
            icon={<Database className="h-4 w-4" />}
            label="Underlying Data"
             copyableText={d.underlying_data}
            accent="from-fuchsia-500/16 to-transparent"
           >
            {d.underlying_data}
          </Row>
         ) : null}
 
         {d.impact ? (
           <Row
            icon={<Sparkles className="h-4 w-4" />}
            label="Impact"
            copyableText={d.impact}
            accent="from-violet-500/18 to-transparent"
           >
            {d.impact}
          </Row>
         ) : null}
      </motion.div>
    </AnimatePresence>
   </div>
 );
}