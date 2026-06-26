import { emitLog } from './emitter.js';
import { getRunOptions } from './runOptions.js';
import { canPrintPrimary } from './policy.js';
import type { CommandStatus } from './types.js';

export interface CommandFooterSummary {
  counts?: Record<string, string | number>;
  notes?: string[];
}

/** Pinned summary footer — emitted after command body (nodehunter-style). */
export function emitCommandFooter(input: {
  command: string;
  status: CommandStatus;
  durationMs: number;
  summary?: CommandFooterSummary;
}): void {
  if (!canPrintPrimary(getRunOptions())) return;

  if (input.summary?.counts && Object.keys(input.summary.counts).length > 0) {
    const countsLine = Object.entries(input.summary.counts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${String(value)}`)
      .join(' · ');
    emitLog({ type: 'summary', text: countsLine });
  }

  if (input.summary?.notes?.length) {
    for (const note of input.summary.notes) {
      emitLog({ type: 'note', text: note });
    }
  }

  emitLog({
    type: 'footer',
    command: input.command,
    status: input.status,
    durationMs: input.durationMs,
  });
}
