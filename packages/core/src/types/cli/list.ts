import type { FilterOptions } from './filters.js';

/** Shared list truncation and tier/category filtering options. */
export type ListViewOptions = FilterOptions & {
  top?: number | string;
  full?: boolean;
};
