import {
  ISSUE_DIFF_EXPORTS_REMOVED,
  ISSUE_DIFF_TIER_VIOLATION,
} from '../shared/constants/diff.js';
import type { DiffFailEvaluation, DiffFailOptions } from '../types/format/diffFail.js';
import type { DiffResult } from '../types/format/diff.js';
import type { Issue } from '../types/json/envelope.js';

/**
 * Opt-in CI fail modes for `diff`. Default (no flags) never fails —
 * removals and tier notes stay informational.
 */
export function evaluateDiffFailMode(
  diff: Pick<DiffResult, 'removed' | 'tierViolations'>,
  options: DiffFailOptions = {},
): DiffFailEvaluation {
  const issues: Issue[] = [];

  if (options.failOnRemoved && diff.removed.length > 0) {
    issues.push({
      severity: 'error',
      code: ISSUE_DIFF_EXPORTS_REMOVED,
      message:
        diff.removed.length === 1
          ? `1 flat export removed: ${diff.removed[0]}`
          : `${diff.removed.length} flat exports removed: ${diff.removed.join(', ')}`,
    });
  }

  if (options.failOnTierViolations) {
    for (const message of diff.tierViolations) {
      issues.push({
        severity: 'error',
        code: ISSUE_DIFF_TIER_VIOLATION,
        message,
      });
    }
  }

  return { passed: issues.length === 0, issues };
}
