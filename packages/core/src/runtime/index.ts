import { installDefaultLogSink, isDefaultSinkInstalled } from './emitter.js';
import { createConsoleLogSink } from './sinks/console.js';

export { configureStyle, style, CLI_NAME, CLI_MARK, BRAND } from './style.js';
export { getRunOptions, setRunOptions, resetRunOptions } from './runOptions.js';
export {
  emitLog,
  subscribeLogSink,
  clearLogSinks,
  installDefaultLogSink,
  isDefaultSinkInstalled,
} from './emitter.js';
export { startCommandTimer, emitJsonResult } from './timer.js';
export { beginCommand, finishCommand } from './command.js';
export { coreLog, coreLogTip, coreLogRaw, coreLogBlank, formatBoxHeader, stripAnsiVisible } from './log.js';
export { createConsoleLogSink } from './sinks/console.js';
export { buildCliJsonEnvelope, stringifyCliCommandJson, stringifyEnvelope } from '../shared/result/cliJson.js';
export { RESULT_API_VERSION } from '../shared/constants/result.js';

export function bootstrapRuntime(): void {
  if (!isDefaultSinkInstalled()) {
    installDefaultLogSink(createConsoleLogSink());
  }
}
