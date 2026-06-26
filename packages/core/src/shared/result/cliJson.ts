import { RESULT_API_VERSION } from '../constants/result.js';
import { getRunOptions } from '../../runtime/runOptions.js';
import type { CliJsonEnvelope, Issue } from '../../types/json/envelope.js';

export function buildCliJsonEnvelope<K extends string, D>(
  kind: K,
  data: D,
  options: {
    ok: boolean;
    issues?: Issue[];
    cwd?: string;
    schemaVersion?: string;
    durationMs?: number;
    command?: string;
  },
): CliJsonEnvelope<K, D> {
  return {
    ok: options.ok,
    kind,
    data,
    issues: options.issues ?? [],
    meta: {
      apiVersion: RESULT_API_VERSION,
      ...(options.schemaVersion !== undefined ? { schemaVersion: options.schemaVersion } : {}),
      ...(options.cwd !== undefined ? { cwd: options.cwd } : {}),
      ...(options.durationMs !== undefined ? { durationMs: options.durationMs } : {}),
      ...(options.command !== undefined ? { command: options.command } : {}),
    },
  };
}

export function stringifyCliCommandJson(input: {
  kind: string;
  data: unknown;
  ok: boolean;
  issues?: Issue[];
  cwd?: string;
  durationMs?: number;
  command?: string;
  pretty?: boolean;
}): string {
  const envelope = buildCliJsonEnvelope(input.kind, input.data, {
    ok: input.ok,
    issues: input.issues,
    cwd: input.cwd,
    durationMs: input.durationMs,
    command: input.command,
  });
  return stringifyEnvelope(envelope, input.pretty);
}

export function stringifyEnvelope<K extends string, D>(
  envelope: CliJsonEnvelope<K, D>,
  pretty?: boolean,
): string {
  const resolvedPretty = pretty ?? getRunOptions().jsonPretty;
  return resolvedPretty ? JSON.stringify(envelope, null, 2) : JSON.stringify(envelope);
}
