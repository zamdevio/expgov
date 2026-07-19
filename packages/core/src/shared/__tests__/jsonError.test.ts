import { afterEach, describe, expect, it } from 'vitest';

import {
  emitJsonError,
  resetRunOptions,
  setRunOptions,
  subscribeLogSink,
} from '../../runtime/index.js';
import type { LogEvent } from '../../types/runtime/index.js';

const unsubscribers: Array<() => void> = [];

afterEach(() => {
  while (unsubscribers.length) unsubscribers.pop()?.();
  resetRunOptions();
});

describe('emitJsonError', () => {
  it('emits a failed command envelope and JSON stdout', () => {
    const events: LogEvent[] = [];
    unsubscribers.push(subscribeLogSink((event) => events.push(event)));
    setRunOptions({ json: true, jsonPretty: false });

    emitJsonError({
      command: 'diff',
      code: 'unknown_ref',
      message: 'Unknown git ref "missing"',
      details: { ref: 'missing' },
      durationMs: 3,
      cwd: '/repo',
    });

    const envelopeEvent = events.find((event) => event.type === 'envelope');
    expect(envelopeEvent).toMatchObject({
      type: 'envelope',
      envelope: {
        ok: false,
        kind: 'diff',
        data: {
          error: {
            code: 'unknown_ref',
            message: 'Unknown git ref "missing"',
            details: { ref: 'missing' },
          },
        },
        issues: [
          {
            severity: 'error',
            code: 'unknown_ref',
            message: 'Unknown git ref "missing"',
          },
        ],
        meta: { command: 'diff', durationMs: 3, cwd: '/repo' },
      },
    });

    const rawEvent = events.find((event) => event.type === 'raw');
    expect(rawEvent).toMatchObject({ type: 'raw', stream: 'stdout' });
    if (rawEvent?.type !== 'raw') throw new Error('missing raw JSON event');
    expect(JSON.parse(rawEvent.message)).toMatchObject({
      ok: false,
      kind: 'diff',
      data: { error: { code: 'unknown_ref' } },
    });
  });
});
