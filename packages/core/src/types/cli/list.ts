import type { FilterOptions } from './filters.js';

/** Shared list truncation, filtering, and compact listing options. */
export type ListViewOptions = FilterOptions & {
  top?: number | string;
  full?: boolean;
  /** Compact listing: detail rows are bare names (human + JSON). */
  namesOnly?: boolean;
};
