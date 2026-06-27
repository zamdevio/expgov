export const WORKTREE_CACHE_KEY = '__worktree__';

/** Default snapshot cache directory (repo-relative). */
export const DEFAULT_CACHE_DIR = '.expgov/cache';

/** Pre-rename cache directory — doctor warns when still present. */
export const LEGACY_CACHE_DIR = '.exports/cache';

export const EXPGOV_DIR = '.expgov';

export const FULL_SNAPSHOT_FILENAME = 'inventory.full.json';
export const TIMELINE_SNAPSHOT_FILENAME = 'timeline.summary.json';

export const CACHE_META_VERSION = 1 as const;
export const SNAPSHOT_VERSION = 1 as const;
export const TOOL_VERSION = 1 as const;
