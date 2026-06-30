import path from 'node:path';

import { getProjectContext } from './index.js';
import {
  FULL_SNAPSHOT_FILENAME,
  TIMELINE_SNAPSHOT_FILENAME,
  WORKTREE_CACHE_KEY,
  WORKTREE_FILES_FILENAME,
} from '../shared/constants/cache.js';

export function getRepoRoot(): string {
  return getProjectContext().repoRoot;
}

export function getCorePkgPath(): string {
  return getProjectContext().corePkgPath;
}

export function getRootIndexRepoPath(): string {
  return getProjectContext().rootIndexRepoPath;
}

export function getRootIndexAbsPath(): string {
  return getProjectContext().rootIndexAbsPath;
}

export function getExportsCacheRoot(): string {
  return getProjectContext().exportsCacheRoot;
}

export function getExportsMetaPath(): string {
  return getProjectContext().exportsMetaPath;
}

export function getSubpathSourceEntries(): Record<string, string> {
  return getProjectContext().subpathSourceEntries;
}

export function getCoreSrcPrefix(): string {
  return getProjectContext().coreSrcPrefix;
}

export function getTimelineBarrelPath(): string {
  return getProjectContext().git.timelineBarrelPath;
}

export function getTagPattern(): string {
  return getProjectContext().git.tagPattern;
}

export function coreRepoPath(relativeToCore: string): string {
  const coreDir = getProjectContext().coreDir;
  const repoRoot = getProjectContext().repoRoot;
  const relCore = path.relative(repoRoot, coreDir).replace(/\\/g, '/');
  return path.posix.join(relCore, relativeToCore.replace(/\\/g, '/'));
}

export function fullSnapshotPathForSha(sha: string): string {
  return path.join(getExportsCacheRoot(), sha, FULL_SNAPSHOT_FILENAME);
}

export function timelineSnapshotPathForSha(sha: string): string {
  return path.join(getExportsCacheRoot(), sha, TIMELINE_SNAPSHOT_FILENAME);
}

export function cacheDirForSha(sha: string): string {
  return path.join(getExportsCacheRoot(), sha);
}

export function worktreeFilesPath(): string {
  return path.join(cacheDirForSha(WORKTREE_CACHE_KEY), WORKTREE_FILES_FILENAME);
}
