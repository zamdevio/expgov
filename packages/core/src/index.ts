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
export { printHelp, printHelpHint } from './help/index.js';
export { formatTimelineRangeHelp } from './time/index.js';
export { formatGitCommitRangeHelp } from './git/index.js';
export type { HelpTopic } from './types/help/index.js';
export { printExportError, printUnexpected } from './logger/index.js';

export {
  buildProjectContext,
  clearProjectContext,
  getProjectContext,
  tryGetProjectContext,
  initProjectContext,
  setProjectContext,
} from './context/index.js';
export { resolveExpgovConfig, formatConfigDiscoveryHint, defineConfig } from './config/load.js';
export { resolveCacheSettings } from './config/resolveCache.js';
export {
  isBuiltinPolicyName,
  policyViolatesRootFlat,
  resolveTierPolicies,
} from './config/tierPolicy.js';
export {
  buildInitConfigTemplate,
  detectInitProject,
  detectionToConfig,
  runInit,
  INIT_CONFIG_FILE_NAME,
} from './init/index.js';
export type { InitDetection, InitLayout, InitRunOptions, InitRunResult } from './types/init/index.js';
export type {
  ExpgovConfig,
  ExpgovConfigOverrides,
  ExpgovCacheConfig,
  ProjectContext,
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

export {
  bootstrapRuntime,
  configureStyle,
  style,
  BRAND,
  getRunOptions,
  setRunOptions,
  resetRunOptions,
  subscribeLogSink,
  clearLogSinks,
  emitLog,
  installDefaultLogSink,
  createConsoleLogSink,
  startCommandTimer,
  emitJsonResult,
  emitJsonError,
  beginCommand,
  finishCommand,
  coreLog,
  coreLogTip,
  coreLogRaw,
  coreLogBlank,
  formatBoxHeader,
  stringifyEnvelope,
  stringifyCliCommandJson,
  buildCliJsonEnvelope,
} from './runtime/index.js';
export { RESULT_API_VERSION } from './shared/constants/result.js';
export { CLI_NAME, CLI_MARK } from './shared/constants/cli.js';
export type {
  RunOptions,
  LogEvent,
  LogSink,
  LogLevel,
  CommandTimer,
  CommandStatus,
} from './types/runtime/index.js';
export type { CliJsonEnvelope, Issue, IssueSeverity, ResultMeta } from './types/json/envelope.js';
export type { JsonErrorData } from './types/json/error.js';
export { SDK_PACKAGE_NAME, SDK_VERSION } from './shared/constants/sdk.js';
