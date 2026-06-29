import process from 'node:process';

import { maybeEmitCacheGitignoreTip } from '../git/gitignore-tip.js';
import { emitCommandFooter } from './footer.js';
import { emitJsonResult, startCommandTimer } from './timer.js';
import { getRunOptions } from './runOptions.js';
import type { CommandFooterSummary } from '../types/runtime/footer.js';
import type { CommandStatus } from '../types/runtime/status.js';
import type { CommandTimer } from '../types/runtime/timer.js';
import type { Issue } from '../types/json/envelope.js';

export function beginCommand(command: string): CommandTimer {
  return startCommandTimer(command);
}

export function finishCommand(input: {
  command: string;
  timer: CommandTimer;
  status: CommandStatus;
  exitCode?: number;
  footer?: CommandFooterSummary;
  json?: {
    kind: string;
    data: unknown;
    ok: boolean;
    issues?: Issue[];
  };
}): number | undefined {
  const durationMs = input.timer.end(input.status, input.exitCode);

  if (getRunOptions().json && input.json) {
    emitJsonResult({
      kind: input.json.kind,
      data: input.json.data,
      ok: input.json.ok,
      issues: input.json.issues,
      command: input.command,
      durationMs,
      cwd: process.cwd(),
    });
    return input.exitCode;
  }

  maybeEmitCacheGitignoreTip();
  emitCommandFooter({
    command: input.command,
    status: input.status,
    durationMs,
    summary: input.footer,
  });
  return input.exitCode;
}
