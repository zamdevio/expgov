import type { CacheStatus } from '../types/cache/index.js';
import type { TimelineWarmEntry, TimelineWarmStats } from '../types/timeline/warm.js';
import { shortSha } from '../git/index.js';

export type { TimelineWarmEntry, TimelineWarmStats } from '../types/timeline/warm.js';

/** Collects per-commit cache warm timings for report-layer rendering. */
export class TimelineWarmer {
  private entries: TimelineWarmEntry[] = [];
  private totalMs = 0;

  constructor(private readonly total: number) {}

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
  }

  finish(): TimelineWarmStats {
    return {
      warmed: this.entries.length,
      totalMs: this.totalMs,
      entries: this.entries,
    };
  }
}
