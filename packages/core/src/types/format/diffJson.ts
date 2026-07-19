import type { JsonListGuidance } from '../json/listGuidance.js';

/** Lean symbol row for `diff --json` detail (`-v` / `-F`). */
export type DiffJsonSymbolDetail = {
  name: string;
  tier: string;
  category: string;
  symbolKind: string;
  targetSubpath: string;
  module?: string;
};

export type DiffJsonListDetail = {
  /** Same cap as human verbose lists (`Infinity` / `-F` → `null` after JSON.stringify). */
  top: number;
  /** Present when `--names-only` — detail arrays are bare name strings. */
  namesOnly?: true;
  addedDetail: DiffJsonSymbolDetail[] | string[];
  removedDetail: DiffJsonSymbolDetail[] | string[];
  addedDetailHidden: number;
  removedDetailHidden: number;
  listGuidance: JsonListGuidance;
};
