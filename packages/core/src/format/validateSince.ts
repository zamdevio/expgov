import { diffSnapshots } from './diff.js';
import { evaluateDiffFailMode } from './diffFail.js';
import type { DiffFailEvaluation } from './diffFail.js';
import type { DiffResult } from '../types/format/diff.js';
import type { InventorySnapshot } from '../types/inventory/index.js';

export type ValidateSinceEvaluation = {
  diff: DiffResult;
  removal: DiffFailEvaluation;
};

/**
 * Baseline → current surface compare for `validate --since`.
 * Removals always fail (same gate as `diff --fail-on-removed`).
 */
export function evaluateValidateSince(
  baseline: InventorySnapshot,
  current: InventorySnapshot,
): ValidateSinceEvaluation {
  const diff = diffSnapshots(baseline, current);
  const removal = evaluateDiffFailMode(diff, { failOnRemoved: true });
  return { diff, removal };
}
