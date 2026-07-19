import type { ListViewOptions } from '../types/cli/list.js';
import type { FilterOptions } from '../types/cli/filters.js';
import type {
  GraphEdge,
  InventorySnapshot,
  InventorySymbol,
} from '../types/inventory/index.js';

export function hasActiveFilters(filters?: FilterOptions | null): boolean {
  return Boolean(filters?.tier?.length || filters?.category?.length);
}

/** Normalize Commander collect / single-string option values. */
export function normalizeFilterList(value?: string | string[]): string[] | undefined {
  if (value == null) return undefined;
  const list = (Array.isArray(value) ? value : [value])
    .map((v) => v.trim())
    .filter(Boolean);
  return list.length ? list : undefined;
}

export function matchesTierCategory(
  item: { tier: string; category: string },
  filters?: FilterOptions | null,
): boolean {
  if (!hasActiveFilters(filters)) return true;
  const tiers = filters!.tier;
  const cats = filters!.category;
  if (tiers?.length && !tiers.includes(item.tier)) return false;
  if (cats?.length && !cats.includes(item.category)) return false;
  return true;
}

export function filterByTierCategory<T extends { tier: string; category: string }>(
  items: readonly T[],
  filters?: FilterOptions | null,
): T[] {
  if (!hasActiveFilters(filters)) return items.slice();
  return items.filter((item) => matchesTierCategory(item, filters));
}

/**
 * Filter re-export edges by joining `edge.symbol` → inventory symbol tier/category.
 * Edges with no matching symbol are dropped when filters are active.
 */
export function filterEdgesBySymbolMeta(
  edges: readonly GraphEdge[],
  symbols: readonly InventorySymbol[],
  filters?: FilterOptions | null,
): GraphEdge[] {
  if (!hasActiveFilters(filters)) return edges.slice();
  const byName = new Map(symbols.map((sym) => [sym.name, sym]));
  return edges.filter((edge) => {
    const sym = byName.get(edge.symbol);
    return sym ? matchesTierCategory(sym, filters) : false;
  });
}

/**
 * Snapshot view-model for filtered graph/inventory listings.
 * Does not rebuild inventory — shallow clone of filtered arrays only.
 */
export function filterSnapshotView(
  snapshot: InventorySnapshot,
  filters?: FilterOptions | ListViewOptions | null,
): InventorySnapshot {
  if (!hasActiveFilters(filters)) return snapshot;
  return {
    ...snapshot,
    symbols: filterByTierCategory(snapshot.symbols, filters),
    namespaces: filterByTierCategory(snapshot.namespaces, filters),
    edges: filterEdgesBySymbolMeta(snapshot.edges, snapshot.symbols, filters),
  };
}

/** Pick filter fields from list/CLI options (ignores top/full). */
export function toFilterOptions(
  options?: FilterOptions | ListViewOptions | null,
): FilterOptions | undefined {
  if (!options) return undefined;
  const tier = normalizeFilterList(options.tier);
  const category = normalizeFilterList(options.category);
  if (!tier && !category) return undefined;
  return { ...(tier ? { tier } : {}), ...(category ? { category } : {}) };
}
