import { filterSymbols, toFilterOptions } from '../shared/filters.js';
import { buildJsonListGuidance, limitList, resolveListLimit } from '../shared/listing.js';
import type { ListViewOptions } from '../types/cli/list.js';
import type { DiffJsonListDetail, DiffJsonSymbolDetail } from '../types/format/diffJson.js';
import type { DiffResult } from '../types/format/diff.js';
import type { InventorySnapshot, InventorySymbol } from '../types/inventory/index.js';

export function shouldIncludeDiffJsonDetail(options: {
  verbose?: boolean;
  full?: boolean;
  namesOnly?: boolean;
}): boolean {
  return Boolean(options.verbose || options.full || options.namesOnly);
}

function mapSymbol(sym: InventorySymbol): DiffJsonSymbolDetail {
  const row: DiffJsonSymbolDetail = {
    name: sym.name,
    tier: sym.tier,
    category: sym.category,
    symbolKind: sym.symbolKind,
    targetSubpath: sym.targetSubpath,
  };
  if (sym.sourceModule) row.module = sym.sourceModule;
  return row;
}

function detailForNames(
  names: string[],
  snapshot: InventorySnapshot,
  filters: ReturnType<typeof toFilterOptions>,
): InventorySymbol[] {
  const byName = new Map(
    snapshot.symbols.filter((s) => s.exportKind === 'flat').map((s) => [s.name, s] as const),
  );
  const matched = names
    .map((name) => byName.get(name))
    .filter((sym): sym is InventorySymbol => Boolean(sym));
  return filterSymbols(matched, filters, snapshot.namespaces);
}

/**
 * Diff JSON detail rows use the same `-T` / `-F` policy as human verbose detail.
 * Name arrays `added` / `removed` stay complete for CI gates.
 * Shared list filters apply to detail rows only (before truncation).
 * `--names-only` emits bare name strings instead of lean objects.
 */
export function buildDiffJsonListDetail(
  diff: Pick<DiffResult, 'added' | 'removed'>,
  left: InventorySnapshot,
  right: InventorySnapshot,
  listView?: ListViewOptions,
): DiffJsonListDetail {
  const filters = toFilterOptions(listView);
  const top = resolveListLimit(listView);
  const namesOnly = Boolean(listView?.namesOnly);
  const addedSyms = detailForNames(diff.added, right, filters);
  const removedSyms = detailForNames(diff.removed, left, filters);

  if (namesOnly) {
    const added = limitList(
      addedSyms.map((s) => s.name),
      top,
    );
    const removed = limitList(
      removedSyms.map((s) => s.name),
      top,
    );
    return {
      top,
      namesOnly: true,
      addedDetail: added.items,
      removedDetail: removed.items,
      addedDetailHidden: added.hiddenCount,
      removedDetailHidden: removed.hiddenCount,
      listGuidance: buildJsonListGuidance([
        { name: 'addedDetail', shown: added.items.length, hidden: added.hiddenCount },
        { name: 'removedDetail', shown: removed.items.length, hidden: removed.hiddenCount },
      ]),
    };
  }

  const added = limitList(addedSyms.map(mapSymbol), top);
  const removed = limitList(removedSyms.map(mapSymbol), top);
  const listGuidance = buildJsonListGuidance([
    { name: 'addedDetail', shown: added.items.length, hidden: added.hiddenCount },
    { name: 'removedDetail', shown: removed.items.length, hidden: removed.hiddenCount },
  ]);

  return {
    top,
    addedDetail: added.items,
    removedDetail: removed.items,
    addedDetailHidden: added.hiddenCount,
    removedDetailHidden: removed.hiddenCount,
    listGuidance,
  };
}
