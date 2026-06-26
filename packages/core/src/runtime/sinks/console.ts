import { getRunOptions } from '../runOptions.js';
import { canPrintPrimary } from '../policy.js';
import type { LogEvent } from '../events.js';
import { BRAND, style } from '../style.js';

function write(stream: 'stdout' | 'stderr', message: string): void {
  if (stream === 'stderr') console.error(message);
  else console.log(message);
}

export function createConsoleLogSink(): (event: LogEvent) => void {
  return (event: LogEvent) => {
    const run = getRunOptions();
    if (run.json && event.type !== 'envelope' && event.type !== 'raw') return;
    if (run.silent && event.type !== 'raw' && event.type !== 'log') return;
    if (
      run.silent &&
      event.type === 'log' &&
      event.level !== 'error' &&
      event.level !== 'warn'
    ) {
      return;
    }
    if (!canPrintPrimary(run) && ['command-line', 'header', 'meta', 'report', 'blank'].includes(event.type)) {
      return;
    }

    switch (event.type) {
      case 'log':
        write(event.level === 'error' ? 'stderr' : 'stdout', event.message);
        break;
      case 'raw':
        write(event.stream ?? 'stdout', event.message);
        break;
      case 'blank':
        console.log('');
        break;
      case 'command-line': {
        const statusText =
          event.status === 'ok'
            ? style.ok(event.status)
            : event.status === 'fail'
              ? style.warn(event.status)
              : style.err(event.status);
        console.log(
          `${BRAND()}  ${style.bold(event.command)} ${style.dim('·')} ${statusText} ${style.dim('·')} ${style.white(`${event.durationMs}ms`)}`,
        );
        break;
      }
      case 'header':
        console.log(`${BRAND()}  ${style.bold(event.command)} ${style.dim('·')} ${event.subtitle}`);
        break;
      case 'meta':
        for (const [key, value] of Object.entries(event.rows)) {
          if (!value) continue;
          console.log(`       ${style.dim(key.padEnd(10))} ${value}`);
        }
        break;
      case 'report':
        console.log(event.body);
        break;
      case 'envelope':
        if (run.json) {
          // host may also stringify via raw event
        }
        break;
      case 'command-start':
      case 'command-end':
        break;
      default:
        break;
    }
  };
}
