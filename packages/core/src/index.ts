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
export type {
  ExpgovConfig,
  ExpgovConfigOverrides,
  ProjectContext,
  TierRulesConfig,
} from './config/types.js';
