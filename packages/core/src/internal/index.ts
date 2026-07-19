/**
 * `@expgov/core/internal` — CLI host / runtime plumbing.
 * Not part of the stable public SDK; may change without a major bump notice on root.
 */

export {
  buildProjectContext,
  clearProjectContext,
  getProjectContext,
  tryGetProjectContext,
  initProjectContext,
  setProjectContext,
} from '../context/index.js';

export { printHelp, printHelpHint } from '../help/index.js';
export { printExportError, printUnexpected } from '../logger/index.js';

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
} from '../runtime/index.js';
export { CLI_NAME, CLI_MARK } from '../shared/constants/cli.js';
export type {
  RunOptions,
  LogEvent,
  LogSink,
  LogLevel,
  CommandTimer,
  CommandStatus,
} from '../types/runtime/index.js';
