/** Truncate/pad inventory verbose columns. */
import { getCoreSrcPrefix } from '../context/paths.js';
import {
  INVENTORY_CATEGORY_WIDTH,
  INVENTORY_NAME_WIDTH,
  INVENTORY_SYMBOL_KIND_WIDTH,
  INVENTORY_TIER_CELL_WIDTH,
} from '../shared/constants/inventory.js';
import type { TierProvenance, TierProvenanceKind } from '../types/inventory/tiers.js';

export function formatInventoryName(name: string): string {
  if (name.length <= 30) return name.padEnd(INVENTORY_NAME_WIDTH);
  return `${name.slice(0, 30)}...`.padEnd(INVENTORY_NAME_WIDTH);
}

export function formatInventoryCategory(category: string): string {
  return category.padEnd(INVENTORY_CATEGORY_WIDTH);
}

export function formatInventorySymbolKind(kind: string): string {
  return kind.padEnd(INVENTORY_SYMBOL_KIND_WIDTH);
}

/** Short provenance kind for verbose inventory: `(exact)`, `(prefix)`, … */
export function formatTierProvenanceKind(kind: TierProvenanceKind | undefined): string {
  switch (kind) {
    case 'tag':
      return 'tag';
    case 'config-exact':
      return 'exact';
    case 'config-prefix':
      return 'prefix';
    case 'default-prefix':
      return 'default-prefix';
    default:
      return 'unclassified';
  }
}

/** Header row for verbose inventory (aligns with `·` data rows). */
export function formatVerboseInventoryHeader(): string {
  return `${formatInventoryName('name')} ${'tier'.padEnd(INVENTORY_TIER_CELL_WIDTH)} ${formatInventoryCategory('category')} ${formatInventorySymbolKind('symbolKind')} targetSubpath`;
}

export function formatSubject(subject: string, maxLen: number, verbose?: boolean): string {
  if (verbose || subject.length <= maxLen) return subject;
  if (maxLen <= 3) return subject.slice(0, maxLen);
  return `${subject.slice(0, maxLen - 3)}...`;
}

export function compactCoreSourcePath(repoPath: string | null): string {
  if (!repoPath) return '(source unresolved)';
  const prefix = getCoreSrcPrefix();
  return repoPath.startsWith(prefix) ? repoPath.slice(prefix.length) : repoPath;
}

export function formatNamespaceSourceLabel(repoPath: string | null): string {
  return `derived from ${compactCoreSourcePath(repoPath)}`;
}

/** Full config-path label (e.g. `tiers.stable.exact`) — prefer short kind for table cells. */
export function formatTierProvenanceLabel(provenance: TierProvenance | undefined): string {
  return provenance?.label ?? 'unclassified';
}

export function formatModuleEdgeProvenance(input: {
  hasFlatReexport: boolean;
  hasNamespaceReexport: boolean;
}): string {
  if (input.hasNamespaceReexport && !input.hasFlatReexport) {
    return 'resolved from namespace analysis';
  }
  return 'root barrel re-export';
}
