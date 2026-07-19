/**
 * `@expgov/core` — stable public surface.
 *
 * Runtime / CLI host APIs: `@expgov/core/internal`
 * Config tooling / init / help formatters: `@expgov/core/advanced`
 */

export {
  runExportsDiff,
  runExportsDoctor,
  runExportsGraph,
  runExportsInventory,
  runExportsTimeline,
  runExportsTrend,
  runExportsSuggest,
  runExportsValidate,
} from './commands/index.js';
export type {
  DiffCliOptions,
  DoctorCliOptions,
  GraphCliOptions,
  InventoryCliOptions,
  TimelineCliOptions,
  TrendCliOptions,
  SuggestCliOptions,
  ValidateOptions,
} from './types/commands/index.js';

export { ExportError, isExportError } from './errors/index.js';
export type { ExportErrorCode } from './types/errors/index.js';

export { defineConfig } from './config/load.js';
export type {
  ExpgovConfig,
  ExpgovConfigOverrides,
  ExpgovCacheConfig,
  TierRulesConfig,
  TierTagConfig,
  TierBucket,
  TierPolicy,
  TierPolicyDefinition,
  TierPolicyRules,
  TierRootFlatRule,
  ResolvedTierPolicy,
  ResolvedTierPolicyRules,
  ResolvedTierBucket,
} from './types/config/index.js';

export { RESULT_API_VERSION } from './shared/constants/result.js';
export { SDK_PACKAGE_NAME, SDK_VERSION } from './shared/constants/sdk.js';
export type { CliJsonEnvelope, Issue, IssueSeverity, ResultMeta } from './types/json/envelope.js';
export type { JsonErrorData } from './types/json/error.js';
