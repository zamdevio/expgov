import type { CacheStatus } from '../cache/index.js';

export interface TimelineRowRollup {
  rootFlat: number;
  stable: number;
}

export interface TimelineRow {
  date: string;
  sha: string;
  subject: string;
  cache: CacheStatus;
  rollup: TimelineRowRollup;
  delta: number | null;
  /** Version tags (`git.tagPattern`) pointing at this commit. */
  tags: string[];
}
