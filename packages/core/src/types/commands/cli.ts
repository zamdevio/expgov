import type { ListViewOptions } from '../cli/list.js';

export interface DiffCliOptions extends ListViewOptions {
  range?: string;
  noCache?: boolean;
  force?: boolean;
  verbose?: boolean;
  /** Exit 1 when flat exports were removed (opt-in CI gate). */
  failOnRemoved?: boolean;
  /** Exit 1 when right-side tier violations exist (opt-in CI gate). */
  failOnTierViolations?: boolean;
}

export interface DoctorCliOptions extends ListViewOptions {
  verbose?: boolean;
}

export interface GraphCliOptions extends ListViewOptions {
  ref?: string;
  noCache?: boolean;
  force?: boolean;
  verbose?: boolean;
}

export interface InventoryCliOptions extends ListViewOptions {
  ref?: string;
  verbose?: boolean;
  noCache?: boolean;
  force?: boolean;
}

export interface SuggestCliOptions extends ListViewOptions {
  verbose?: boolean;
}

export type TierExactSuggestion = {
  bucket: 'stable';
  names: string[];
};

export interface TimelineCliOptions extends ListViewOptions {
  range?: string;
  noCache?: boolean;
  force?: boolean;
  verbose?: boolean;
}

export interface TrendCliOptions extends ListViewOptions {
  tagLimit?: number;
  noCache?: boolean;
  force?: boolean;
  verbose?: boolean;
}

export interface ValidateOptions extends ListViewOptions {
  /** Fail when flat exports were removed relative to this git ref (worktree right side). */
  since?: string;
  verbose?: boolean;
}
