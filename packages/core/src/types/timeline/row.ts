import type { CacheStatus } from '../cache/index.js';
import type { TimelineStepMeta } from './step.js';

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
  /** Pairwise diff vs the row above (newer commit); null on newest row. */
  step: TimelineStepMeta | null;
  /** Version tags (`git.tagPattern`) pointing at this commit. */
  tags: string[];
}
