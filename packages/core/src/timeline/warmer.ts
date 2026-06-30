import type { CacheStatus } from '../types/cache/index.js';
import type { TimelineWarmEntry, TimelineWarmStats } from '../types/timeline/warm.js';
import { shortSha } from '../git/index.js';
import { coreLogRaw } from '../runtime/log.js';
import { CLI_NAME } from '../runtime/style.js';

export type { TimelineWarmEntry, TimelineWarmStats } from '../types/timeline/warm.js';

/** Collects per-commit cache warm timings; spinner on stderr until report prints. */
export class TimelineWarmer {
  private entries: TimelineWarmEntry[] = [];
  private totalMs = 0;

  constructor(
    private readonly total: number,
    private readonly verbose: boolean,
  ) {}

  tick(sha: string, ms: number, cache: CacheStatus): void {
    const index = this.entries.length + 1;
    this.entries.push({
      index,
      total: this.total,
      sha: shortSha(sha),
      cache,
      ms,
    });
    this.totalMs += ms;

    if (this.verbose || this.total <= 0) return;

    coreLogRaw(
      `\r\x1b[K${CLI_NAME}  timeline · warming ${index}/${this.total} · ${this.totalMs}ms …`,
      'stderr',
    );
  }

  finish(): TimelineWarmStats {
    if (!this.verbose && this.total > 0) {
      coreLogRaw('\r\x1b[K', 'stderr');
    }
    return {
      warmed: this.entries.length,
      totalMs: this.totalMs,
      entries: this.entries,
    };
  }
}
