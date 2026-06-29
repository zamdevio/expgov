import type { InventorySnapshot } from '../inventory/index.js';
import { getProjectContext } from '../context/index.js';
import { policyViolatesRootFlat } from '../config/tierPolicy.js';

export interface DiffResult {
  added: string[];
  removed: string[];
  summaryDelta: {
    left: InventorySnapshot['summary'];
    right: InventorySnapshot['summary'];
  };
  tierViolations: string[];
}

export function diffSnapshots(left: InventorySnapshot, right: InventorySnapshot): DiffResult {
  const leftNames = new Set(left.symbols.filter((s) => s.exportKind === 'flat').map((s) => s.name));
  const rightNames = new Set(right.symbols.filter((s) => s.exportKind === 'flat').map((s) => s.name));

  const added = [...rightNames].filter((n) => !leftNames.has(n)).sort();
  const removed = [...leftNames].filter((n) => !rightNames.has(n)).sort();

  const tierViolations: string[] = [];
  const { tierCatalog } = getProjectContext();

  for (const sym of right.symbols) {
    if (sym.exportKind !== 'flat') continue;
    if (sym.tier === 'unclassified') {
      tierViolations.push(`${sym.name} (unclassified)`);
      continue;
    }
    const entry = tierCatalog.byName.get(sym.tier);
    if (entry && policyViolatesRootFlat(entry.policy)) {
      tierViolations.push(`${sym.name} (${sym.tier}) exported flat on root`);
    }
  }

  return {
    added,
    removed,
    summaryDelta: { left: left.summary, right: right.summary },
    tierViolations,
  };
}
