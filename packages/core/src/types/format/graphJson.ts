import type { GraphEdge } from '../inventory/index.js';
import type { JsonListGuidance } from '../json/listGuidance.js';

/** Lean edge row for `graph --json` detail (`-v` / `-F`). */
export type GraphJsonEdge = {
  kind: GraphEdge['kind'];
  from: string;
  symbol: string;
  toModule: string;
  targetSubpath: string;
};

export type GraphJsonListDetail = {
  /** Same cap as human lists (`Infinity` / `-F` → `null` after JSON.stringify). */
  top: number;
  edges: GraphJsonEdge[];
  edgesHidden: number;
  listGuidance: JsonListGuidance;
};
