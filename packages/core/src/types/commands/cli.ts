import type { ListViewOptions } from '../cli/list.js';

export interface DiffCliOptions extends ListViewOptions {
  range?: string;
  noCache?: boolean;
  force?: boolean;
  verbose?: boolean;
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
  since?: string;
  verbose?: boolean;
}
