/** Snapshot cache block in `expgov.config.ts`. */
export interface ExpgovCacheConfig {
  /**
   * Persist inventory snapshots under `dir` (default `true`).
   * When `false`, every run builds fresh — same as perpetual `--no-cache` without a CLI flag.
   */
  enabled?: boolean;
  /** Repo-relative cache root (default `.expgov/cache`). */
  dir?: string;
}

/** `cache` field: shorthand boolean or expanded block. */
export type ExpgovCacheInput = boolean | ExpgovCacheConfig;
