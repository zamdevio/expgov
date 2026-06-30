import type { SourceRef } from '../git/ref.js';

export interface TimelineTimeRange {
  kind: 'time';
  label: string;
  since: string;
  until: string;
  sinceIso: string;
  untilIso: string;
}

export interface TimelineRefRange {
  kind: 'ref';
  label: string;
  left: SourceRef & { kind: 'commit' };
  right: SourceRef & { kind: 'commit' };
}

export type TimelineRange = TimelineTimeRange | TimelineRefRange;
