import type { JsonListGuidance } from '../json/listGuidance.js';

/** Lean symbol row for `inventory --json` detail (`-v` / `-F`). */
export type InventoryJsonSymbol = {
  name: string;
  tier: string;
  category: string;
  symbolKind: string;
  targetSubpath: string;
  module?: string;
};

/** Lean namespace row for `inventory --json` detail (`-v` / `-F`). */
export type InventoryJsonNamespace = {
  name: string;
  targetSubpath: string;
  module: string;
  tier: string;
};

export type InventoryJsonListDetail = {
  /** Same cap as human lists (`Infinity` / `-F` → `null` after JSON.stringify). */
  top: number;
  /** Present when `--names-only` — `symbols` / `namespaces` are bare name strings. */
  namesOnly?: true;
  symbols: InventoryJsonSymbol[] | string[];
  namespaces: InventoryJsonNamespace[] | string[];
  symbolsHidden: number;
  namespacesHidden: number;
  listGuidance: JsonListGuidance;
};
