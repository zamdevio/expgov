import { emitLog } from './emitter.js';
import type { CommandStatus } from '../runtime/types.js';
import { getRunOptions } from './runOptions.js';
import { canPrintPrimary } from './policy.js';
import { buildCliJsonEnvelope, stringifyEnvelope } from '../shared/result/cliJson.js';
import type { Issue } from '../types/json/envelope.js';

export interface CommandTimer {
  end(status: CommandStatus, exitCode?: number): number;
  elapsed(): number;
}

export function startCommandTimer(command: string): CommandTimer {
  const t0 = performance.now();
  if (!getRunOptions().json) {
    emitLog({ type: 'command-start', command });
  }
  return {
    elapsed(): number {
      return Math.round(performance.now() - t0);
    },
    end(status: CommandStatus, exitCode?: number): number {
      const durationMs = Math.round(performance.now() - t0);
      if (!getRunOptions().json && canPrintPrimary(getRunOptions())) {
        emitLog({ type: 'command-line', command, status, durationMs });
      }
      emitLog({ type: 'command-end', command, status, durationMs, exitCode });
      return durationMs;
    },
  };
}

export function emitJsonResult<K extends string, D>(input: {
  kind: K;
  data: D;
  ok: boolean;
  issues?: Issue[];
  command: string;
  durationMs: number;
  cwd?: string;
}): void {
  const envelope = buildCliJsonEnvelope(input.kind, input.data, {
    ok: input.ok,
    issues: input.issues,
    cwd: input.cwd,
    durationMs: input.durationMs,
    command: input.command,
  });
  emitLog({ type: 'envelope', envelope });
  if (getRunOptions().json) {
    emitLog({ type: 'raw', message: stringifyEnvelope(envelope), stream: 'stdout' });
  }
}
