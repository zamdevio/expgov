export {
  runExportsDiff,
  type DiffCliOptions,
} from './commands/diff.js';
export {
  runExportsGraph,
  type GraphCliOptions,
} from './commands/graph.js';
export {
  runExportsInventory,
  type InventoryCliOptions,
} from './commands/inventory.js';
export {
  runExportsTimeline,
  type TimelineCliOptions,
} from './commands/timeline.js';
export {
  runExportsTrend,
  type TrendCliOptions,
} from './commands/trend.js';
export {
  runExportsValidate,
  type ValidateOptions,
} from './commands/validate.js';

export { ExportError, isExportError, type ExportErrorCode } from './errors/index.js';
export { printHelp, printHelpHint, type HelpTopic } from './help/index.js';
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
export {
  buildInitConfigTemplate,
  detectInitProject,
  detectionToConfig,
  runInit,
  INIT_CONFIG_FILE_NAME,
  type InitDetection,
  type InitLayout,
  type InitRunOptions,
  type InitRunResult,
} from './init/index.js';
export type {
  ExpgovConfig,
  ExpgovConfigOverrides,
  ProjectContext,
  TierRulesConfig,
  TierBucket,
} from './config/types.js';

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
export type { RunOptions, LogEvent, LogSink, LogLevel, CommandTimer, CommandStatus } from './runtime/index.js';
export type { CliJsonEnvelope, Issue, IssueSeverity, ResultMeta } from './types/json/envelope.js';
