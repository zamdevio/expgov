import type { ListViewOptions } from '../types/cli/list.js';
import type { FilterOptions } from '../types/cli/filters.js';
import type {
  GraphEdge,
  InventoryNamespace,
  InventorySnapshot,
  InventorySymbol,
} from '../types/inventory/index.js';

export function hasActiveFilters(filters?: FilterOptions | null): boolean {
  return Boolean(
    filters?.tier?.length ||
      filters?.category?.length ||
      filters?.namespace?.length ||
      filters?.module?.length ||
      filters?.subpath?.length,
  );
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
  if (!filters?.tier?.length && !filters?.category?.length) return true;
  const tiers = filters.tier;
  const cats = filters.category;
  if (tiers?.length && !tiers.includes(item.tier)) return false;
  if (cats?.length && !cats.includes(item.category)) return false;
  return true;
}

function matchesAnySubstring(value: string, needles?: string[]): boolean {
  if (!needles?.length) return true;
  return needles.some((needle) => value.includes(needle));
}

/** Compare subpaths allowing `./types` ↔ `types` style aliases. */
export function matchesSubpath(value: string, needles?: string[]): boolean {
  if (!needles?.length) return true;
  const normalized = value.replace(/^\.\//, '');
  return needles.some((needle) => {
    const want = needle.replace(/^\.\//, '');
    return value === needle || normalized === want || value.endsWith(`/${want}`);
  });
}

function namespaceModuleSet(
  filters: FilterOptions | null | undefined,
  namespaces: readonly InventoryNamespace[],
): Set<string> | undefined {
  if (!filters?.namespace?.length) return undefined;
  const wanted = new Set(filters.namespace);
  const modules = new Set<string>();
  for (const ns of namespaces) {
    if (!wanted.has(ns.name)) continue;
    if (ns.sourceModule) modules.add(ns.sourceModule);
  }
  return modules;
}

export function filterNamespaces(
  namespaces: readonly InventoryNamespace[],
  filters?: FilterOptions | null,
): InventoryNamespace[] {
  if (!hasActiveFilters(filters)) return namespaces.slice();
  return namespaces.filter((ns) => {
    if (!matchesTierCategory(ns, filters)) return false;
    if (filters?.namespace?.length && !filters.namespace.includes(ns.name)) return false;
    if (filters?.module?.length && !matchesAnySubstring(ns.sourceModule ?? '', filters.module)) {
      return false;
    }
    if (filters?.subpath?.length && !matchesSubpath(ns.targetSubpath, filters.subpath)) {
      return false;
    }
    return true;
  });
}

export function filterSymbols(
  symbols: readonly InventorySymbol[],
  filters?: FilterOptions | null,
  namespaces: readonly InventoryNamespace[] = [],
): InventorySymbol[] {
  if (!hasActiveFilters(filters)) return symbols.slice();
  const nsModules = namespaceModuleSet(filters, namespaces);
  return symbols.filter((sym) => {
    if (!matchesTierCategory(sym, filters)) return false;
    if (filters?.module?.length && !matchesAnySubstring(sym.sourceModule ?? '', filters.module)) {
      return false;
    }
    if (filters?.subpath?.length && !matchesSubpath(sym.targetSubpath, filters.subpath)) {
      return false;
    }
    if (nsModules) {
      const inNsModule = Boolean(sym.sourceModule && nsModules.has(sym.sourceModule));
      const isNsName = Boolean(filters?.namespace?.includes(sym.name));
      if (!inNsModule && !isNsName) return false;
    }
    return true;
  });
}

/** Prefer filterSymbols / filterNamespaces for full filter dimensions. */
export function filterByTierCategory<T extends { tier: string; category: string }>(
  items: readonly T[],
  filters?: FilterOptions | null,
): T[] {
  if (!filters?.tier?.length && !filters?.category?.length) return items.slice();
  return items.filter((item) => matchesTierCategory(item, filters));
}

/**
 * Filter re-export edges by tier/category/module/subpath/namespace.
 * Edges with no matching symbol are dropped when tier/category/subpath/namespace filters need symbol meta.
 */
export function filterEdgesBySymbolMeta(
  edges: readonly GraphEdge[],
  symbols: readonly InventorySymbol[],
  filters?: FilterOptions | null,
  namespaces: readonly InventoryNamespace[] = [],
): GraphEdge[] {
  if (!hasActiveFilters(filters)) return edges.slice();
  const byName = new Map(symbols.map((sym) => [sym.name, sym]));
  const nsModules = namespaceModuleSet(filters, namespaces);
  const needsSymbolMeta = Boolean(
    filters?.tier?.length || filters?.category?.length || filters?.subpath?.length || nsModules,
  );

  return edges.filter((edge) => {
    if (filters?.module?.length && !matchesAnySubstring(edge.toModule, filters.module)) {
      return false;
    }

    const sym = byName.get(edge.symbol);
    if (needsSymbolMeta && !sym) {
      // Namespace re-exports may use the namespace name as `symbol`.
      if (nsModules && filters?.namespace?.includes(edge.symbol)) {
        return !filters.module?.length || matchesAnySubstring(edge.toModule, filters.module);
      }
      if (nsModules && nsModules.has(edge.toModule)) return true;
      return false;
    }

    if (sym) {
      if (!matchesTierCategory(sym, filters)) return false;
      if (filters?.subpath?.length) {
        const hit =
          matchesSubpath(sym.targetSubpath, filters.subpath) ||
          matchesSubpath(edge.targetSubpath, filters.subpath);
        if (!hit) return false;
      }
      if (nsModules) {
        const inNsModule = Boolean(sym.sourceModule && nsModules.has(sym.sourceModule));
        const isNsName = Boolean(filters?.namespace?.includes(edge.symbol));
        const edgeModuleInNs = nsModules.has(edge.toModule);
        if (!inNsModule && !isNsName && !edgeModuleInNs) return false;
      }
    } else if (filters?.subpath?.length && !matchesSubpath(edge.targetSubpath, filters.subpath)) {
      return false;
    }

    return true;
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
    symbols: filterSymbols(snapshot.symbols, filters, snapshot.namespaces),
    namespaces: filterNamespaces(snapshot.namespaces, filters),
    edges: filterEdgesBySymbolMeta(
      snapshot.edges,
      snapshot.symbols,
      filters,
      snapshot.namespaces,
    ),
  };
}

/** Pick filter fields from list/CLI options (ignores top/full). */
export function toFilterOptions(
  options?: FilterOptions | ListViewOptions | null,
): FilterOptions | undefined {
  if (!options) return undefined;
  const tier = normalizeFilterList(options.tier);
  const category = normalizeFilterList(options.category);
  const namespace = normalizeFilterList(options.namespace);
  const module = normalizeFilterList(options.module);
  const subpath = normalizeFilterList(options.subpath);
  if (!tier && !category && !namespace && !module && !subpath) return undefined;
  return {
    ...(tier ? { tier } : {}),
    ...(category ? { category } : {}),
    ...(namespace ? { namespace } : {}),
    ...(module ? { module } : {}),
    ...(subpath ? { subpath } : {}),
  };
}

const FILTER_META_KEYS = ['tier', 'category', 'namespace', 'module', 'subpath'] as const;

/** Human meta line: `tier=stable · module=commands` (undefined when no filters). */
export function formatAppliedFiltersMeta(
  filters?: FilterOptions | null,
): string | undefined {
  if (!hasActiveFilters(filters) || !filters) return undefined;
  const parts: string[] = [];
  for (const key of FILTER_META_KEYS) {
    const values = filters[key];
    if (!values?.length) continue;
    parts.push(`${key}=${values.join(',')}`);
  }
  return parts.length ? parts.join(' · ') : undefined;
}
