import { ExportError } from '../errors/index.js';
import { getTagPattern } from '../context/paths.js';
import { listVersionTags } from './log.js';

/** Config sentinel — resolve to the newest tag matching `git.tagPattern`. */
export const COMPAT_BASELINE_LATEST_TAG = 'latest-tag';

/**
 * Resolve `git.compatBaseline` to a concrete git ref.
 * Returns `undefined` when unset. CLI `--since` is resolved separately and wins.
 */
export function resolveCompatBaseline(
  baseline: string | undefined,
  tags?: string[],
): string | undefined {
  if (!baseline) return undefined;
  if (baseline === COMPAT_BASELINE_LATEST_TAG) {
    const resolved = tags ?? listVersionTags();
    const latest = resolved.at(-1);
    if (!latest) {
      throw new ExportError(
        `git.compatBaseline is "${COMPAT_BASELINE_LATEST_TAG}" but no tags match git.tagPattern`,
        'unknown_ref',
        {
          details: {
            tagPattern: getTagPattern(),
            suggestion:
              'Create a version tag matching git.tagPattern, or set git.compatBaseline to a specific ref (e.g. v1.0.0).',
          },
        },
      );
    }
    return latest;
  }
  return baseline;
}

/** Effective validate baseline: CLI `--since` wins over `git.compatBaseline`. */
export function resolveValidateSinceRef(
  cliSince: string | undefined,
  configBaseline: string | undefined,
): string | undefined {
  return cliSince ?? resolveCompatBaseline(configBaseline);
}
