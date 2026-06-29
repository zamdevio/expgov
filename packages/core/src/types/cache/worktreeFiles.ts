/** Per-file record in worktree `files.json` (content hash + debug metadata). */
export interface WorktreeFileRecord {
  hash: string;
  size: number;
  mtimeMs: number;
}

/** Worktree-only tracked file index under `.expgov/cache/__worktree__/files.json`. */
export interface WorktreeFilesState {
  version: number;
  updatedAt: string;
  files: Record<string, WorktreeFileRecord>;
  /** Digest of `files` when the snapshot was produced — bound to inventory payload. */
  inputFilesEpoch?: string;
}
