/** Per-command flags merged by `addListFlags` / `addCacheFlags`. */
export interface VerboseOpts {
  verbose?: boolean;
}

export interface ListFlagOpts {
  top?: number;
  full?: boolean;
}

export interface CacheFlagOpts {
  force?: boolean;
  cache?: boolean;
}

export type CacheListVerboseOpts = VerboseOpts & ListFlagOpts & CacheFlagOpts;

export interface InitCommandOpts {
  yes?: boolean;
  rich?: boolean;
  force?: boolean;
}

export interface ValidateCommandOpts extends VerboseOpts, ListFlagOpts {
  since?: string;
}

export interface TrendCommandOpts extends CacheListVerboseOpts {
  tags: number;
}

export interface VersionCommandOpts {
  check?: boolean;
  reset?: boolean;
}
