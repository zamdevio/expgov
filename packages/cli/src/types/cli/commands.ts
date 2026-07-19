/** Per-command flags merged by `addListFlags` / `addCacheFlags` / `addFilterFlags`. */
export interface VerboseOpts {
  verbose?: boolean;
}

export interface ListFlagOpts {
  top?: number;
  full?: boolean;
}

export interface FilterFlagOpts {
  tier?: string[];
  category?: string[];
  namespace?: string[];
  module?: string[];
  subpath?: string[];
  namesOnly?: boolean;
}

export interface CacheFlagOpts {
  force?: boolean;
  cache?: boolean;
}

export type CacheListVerboseOpts = VerboseOpts & ListFlagOpts & CacheFlagOpts & FilterFlagOpts;

export interface InitCommandOpts {
  yes?: boolean;
  rich?: boolean;
  force?: boolean;
}

export interface ValidateCommandOpts extends VerboseOpts, ListFlagOpts {
  since?: string;
}

export interface DiffCommandOpts extends CacheListVerboseOpts {
  failOnRemoved?: boolean;
  failOnTierViolations?: boolean;
}

export interface TrendCommandOpts extends CacheListVerboseOpts {
  tags: number;
}

export interface VersionCommandOpts {
  check?: boolean;
  reset?: boolean;
}
