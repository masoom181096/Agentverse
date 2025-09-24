import { DATA_URL } from "@/config";
import type { GraphData } from "@/graph/types";
import { normalizeLevels } from "@/graph/normalize";

async function fetchJson(url:string):Promise<any>{
  const res = await fetch(`${url}${url.includes("?")?"":`?t=${Date.now()}`}`, { cache:"no-store" });
  const text = await res.text();        // tolerate wrong content-type
  try { return JSON.parse(text); } catch { throw new Error(`Invalid JSON at ${url}`); }
}

export async function loadGraphStrict(): Promise<GraphData> {
 const res = await fetch(`${DATA_URL}?t=${Date.now()}`, { cache: "no-store" });
 const text = await res.text();
 const data = JSON.parse(text);
 if (!data?.nodes?.length) throw new Error("agents_graph.json has no nodes");
 return normalizeLevels(data);
}
