import type { CacheStatus } from '../cache/index.js';

export interface TimelineWarmEntry {
  index: number;
  total: number;
  sha: string;
  cache: CacheStatus;
  ms: number;
}

export interface TimelineWarmStats {
  warmed: number;
  totalMs: number;
  entries: TimelineWarmEntry[];
}
