import { buildJsonListGuidance, limitList, resolveListLimit } from '../shared/listing.js';
import type { JsonListGuidance } from '../shared/listing.js';
import type { ListViewOptions } from '../types/cli/list.js';
import type {
  InventoryNamespace,
  InventorySymbol,
} from '../types/inventory/index.js';

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
  symbols: InventoryJsonSymbol[];
  namespaces: InventoryJsonNamespace[];
  symbolsHidden: number;
  namespacesHidden: number;
  listGuidance: JsonListGuidance;
};

export function shouldIncludeInventoryJsonDetail(options: {
  verbose?: boolean;
  full?: boolean;
}): boolean {
  return Boolean(options.verbose || options.full);
}

function mapSymbol(sym: InventorySymbol): InventoryJsonSymbol {
  const row: InventoryJsonSymbol = {
    name: sym.name,
    tier: sym.tier,
    category: sym.category,
    symbolKind: sym.symbolKind,
    targetSubpath: sym.targetSubpath,
  };
  if (sym.sourceModule) row.module = sym.sourceModule;
  return row;
}

function mapNamespace(ns: InventoryNamespace): InventoryJsonNamespace {
  return {
    name: ns.name,
    targetSubpath: ns.targetSubpath,
    module: ns.sourceModule ?? '',
    tier: ns.tier,
  };
}

/** Root flat symbols only — sorted by name. */
export function toInventoryJsonSymbols(symbols: InventorySymbol[]): InventoryJsonSymbol[] {
  return symbols
    .filter((sym) => sym.exportKind === 'flat')
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(mapSymbol);
}

/** Root namespaces — sorted by name. */
export function toInventoryJsonNamespaces(
  namespaces: InventoryNamespace[],
): InventoryJsonNamespace[] {
  return namespaces
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(mapNamespace);
}

/**
 * Inventory JSON detail lists use the same `-T` / `-F` policy as human verbose lists.
 */
export function buildInventoryJsonListDetail(
  snapshot: {
    symbols: InventorySymbol[];
    namespaces: InventoryNamespace[];
  },
  listView?: ListViewOptions,
): InventoryJsonListDetail {
  const top = resolveListLimit(listView);
  const symbols = limitList(toInventoryJsonSymbols(snapshot.symbols), top);
  const namespaces = limitList(toInventoryJsonNamespaces(snapshot.namespaces), top);
  const listGuidance = buildJsonListGuidance([
    { name: 'symbols', shown: symbols.items.length, hidden: symbols.hiddenCount },
    { name: 'namespaces', shown: namespaces.items.length, hidden: namespaces.hiddenCount },
  ]);

  return {
    top,
    symbols: symbols.items,
    namespaces: namespaces.items,
    symbolsHidden: symbols.hiddenCount,
    namespacesHidden: namespaces.hiddenCount,
    listGuidance,
  };
}
