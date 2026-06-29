import type { InventorySummary } from '../inventory/snapshot.js';

export interface DiffResult {
  added: string[];
  removed: string[];
  summaryDelta: {
    left: InventorySummary;
    right: InventorySummary;
  };
  tierViolations: string[];
}
