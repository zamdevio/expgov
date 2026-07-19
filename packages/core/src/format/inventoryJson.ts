import { filterNamespaces, filterSymbols, toFilterOptions } from '../shared/filters.js';
import { buildJsonListGuidance, limitList, resolveListLimit } from '../shared/listing.js';
import type { ListViewOptions } from '../types/cli/list.js';
import type {
  InventoryJsonListDetail,
  InventoryJsonNamespace,
  InventoryJsonSymbol,
} from '../types/format/inventoryJson.js';
import type {
  InventoryNamespace,
  InventorySymbol,
} from '../types/inventory/index.js';

export function shouldIncludeInventoryJsonDetail(options: {
  verbose?: boolean;
  full?: boolean;
  namesOnly?: boolean;
}): boolean {
  return Boolean(options.verbose || options.full || options.namesOnly);
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
 * `--tier` / `--category` filter before truncation.
 * `--names-only` emits bare name strings instead of lean objects.
 */
export function buildInventoryJsonListDetail(
  snapshot: {
    symbols: InventorySymbol[];
    namespaces: InventoryNamespace[];
  },
  listView?: ListViewOptions,
): InventoryJsonListDetail {
  const filters = toFilterOptions(listView);
  const top = resolveListLimit(listView);
  const namesOnly = Boolean(listView?.namesOnly);
  // Filter inventory rows before JSON map (namespace JSON omits category).
  const filteredSymbols = filterSymbols(snapshot.symbols, filters, snapshot.namespaces);
  const filteredNamespaces = filterNamespaces(snapshot.namespaces, filters);

  if (namesOnly) {
    const symbols = limitList(
      toInventoryJsonSymbols(filteredSymbols).map((s) => s.name),
      top,
    );
    const namespaces = limitList(
      toInventoryJsonNamespaces(filteredNamespaces).map((n) => n.name),
      top,
    );
    return {
      top,
      namesOnly: true,
      symbols: symbols.items,
      namespaces: namespaces.items,
      symbolsHidden: symbols.hiddenCount,
      namespacesHidden: namespaces.hiddenCount,
      listGuidance: buildJsonListGuidance([
        { name: 'symbols', shown: symbols.items.length, hidden: symbols.hiddenCount },
        { name: 'namespaces', shown: namespaces.items.length, hidden: namespaces.hiddenCount },
      ]),
    };
  }

  const symbols = limitList(toInventoryJsonSymbols(filteredSymbols), top);
  const namespaces = limitList(toInventoryJsonNamespaces(filteredNamespaces), top);
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
