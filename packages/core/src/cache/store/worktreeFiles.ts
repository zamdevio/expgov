import { mkdirSync } from 'node:fs';

import type { WorktreeFileRecord, WorktreeFilesState } from '../../types/cache/worktreeFiles.js';
import { WORKTREE_CACHE_KEY, WORKTREE_FILES_VERSION } from '../../shared/constants/cache.js';
import { cacheDirForSha, worktreeFilesPath } from '../../context/paths.js';
import { readJsonFile, writeJsonAtomic } from './io.js';

function isValidWorktreeFilesState(value: unknown): value is WorktreeFilesState {
  if (!value || typeof value !== 'object') return false;
  const state = value as WorktreeFilesState;
  return state.version === WORKTREE_FILES_VERSION && !!state.files && typeof state.files === 'object';
}

export function loadWorktreeFilesState(): WorktreeFilesState | undefined {
  const raw = readJsonFile<WorktreeFilesState>(worktreeFilesPath());
  if (!raw || !isValidWorktreeFilesState(raw)) return undefined;
  return raw;
}

export function saveWorktreeFilesState(
  files: Record<string, WorktreeFileRecord>,
  inputFilesEpoch: string,
): WorktreeFilesState {
  const state: WorktreeFilesState = {
    version: WORKTREE_FILES_VERSION,
    updatedAt: new Date().toISOString(),
    files,
    inputFilesEpoch,
  };
  const dir = cacheDirForSha(WORKTREE_CACHE_KEY);
  mkdirSync(dir, { recursive: true });
  writeJsonAtomic(worktreeFilesPath(), state);
  return state;
}
