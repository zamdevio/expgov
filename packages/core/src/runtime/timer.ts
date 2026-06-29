import { emitLog } from './emitter.js';
import type { CommandTimer } from '../types/runtime/timer.js';
import type { CommandStatus } from '../types/runtime/status.js';
import { getRunOptions } from './runOptions.js';
import { buildCliJsonEnvelope, stringifyEnvelope } from '../shared/result/cliJson.js';
import type { Issue } from '../types/json/envelope.js';

export function startCommandTimer(_command: string): CommandTimer {
  const t0 = performance.now();
  return {
    elapsed(): number {
      return Math.round(performance.now() - t0);
    },
    end(_status: CommandStatus, _exitCode?: number): number {
      return Math.round(performance.now() - t0);
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
