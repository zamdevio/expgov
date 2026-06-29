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
  ResolvedTierBucket,
} from './types/config/index.js';

export {
  bootstrapRuntime,
  configureStyle,
  style,
  CLI_NAME,
  CLI_MARK,
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
  RESULT_API_VERSION,
} from './runtime/index.js';
export type {
  RunOptions,
  LogEvent,
  LogSink,
  LogLevel,
  CommandTimer,
  CommandStatus,
} from './types/runtime/index.js';
export type { CliJsonEnvelope, Issue, IssueSeverity, ResultMeta } from './types/json/envelope.js';
export { SDK_PACKAGE_NAME, SDK_VERSION } from './shared/constants/sdk.js';
