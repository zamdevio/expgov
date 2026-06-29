export type SourceRef =
  | { kind: 'worktree'; label: string }
  | { kind: 'commit'; sha: string; label: string };
