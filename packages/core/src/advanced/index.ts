/**
 * `@expgov/core/advanced` — supported but not semver-stable root surface.
 * Prefer root `@expgov/core` for config + `runExports*` consumers.
 */

export { resolveExpgovConfig, formatConfigDiscoveryHint } from '../config/load.js';
export { resolveCacheSettings } from '../config/resolveCache.js';
export {
  isBuiltinPolicyName,
  policyViolatesRootFlat,
  resolveTierPolicies,
} from '../config/tierPolicy.js';
export {
  buildInitConfigTemplate,
  detectInitProject,
  detectionToConfig,
  runInit,
  INIT_CONFIG_FILE_NAME,
} from '../init/index.js';
export type { InitDetection, InitLayout, InitRunOptions, InitRunResult } from '../types/init/index.js';
export type { ProjectContext } from '../types/config/index.js';
export type { HelpTopic } from '../types/help/index.js';
export { formatTimelineRangeHelp } from '../time/index.js';
export { formatGitCommitRangeHelp } from '../git/index.js';
