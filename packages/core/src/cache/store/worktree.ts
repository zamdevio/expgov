import { readFileSync } from 'node:fs';

import { buildSnapshot } from '../../inventory/index.js';
import type { InventorySnapshot } from '../../types/inventory/snapshot.js';
import { createWorktreeReader } from '../../inventory/source.js';
import { WORKTREE_CACHE_KEY } from '../../shared/constants/cache.js';
import {
  getRootIndexAbsPath,
  getRootIndexRepoPath,
} from '../../paths.js';
import { readCachedForProfile } from './files.js';
import { loadCacheMeta } from './meta.js';
import {
  buildTimelineSnapshot,
  persistSnapshot,
  persistTimelineSnapshot,
} from './persist.js';
import type { CacheOptions, SnapshotResult } from '../../types/cache/store.js';
import { rebuildCacheStatus, shouldReadCache, shouldWriteCache } from './mode.js';
import { isFullSnapshot, isTimelineSnapshot } from './validation.js';
import {
  buildWorktreeFileRecords,
  computeInputFilesEpoch,
  fileRecordsMatch,
  resolveTrackedPathsForRead,
  scanCurrentFileRecords,
} from './worktreeTrack.js';
import { loadWorktreeFilesState, saveWorktreeFilesState } from './worktreeFiles.js';

function readWorktreeSource(): string {
  return readFileSync(getRootIndexAbsPath(), 'utf8');
}

function resolveProfile(options: CacheOptions): 'full' | 'timeline' {
  if (options.profile) return options.profile;
  if (options.depth === 'light') return 'timeline';
  return 'full';
}

function worktreeCacheHit(cached: InventorySnapshot, inputFilesEpoch: string): boolean {
  return !!cached.inputFilesEpoch && cached.inputFilesEpoch === inputFilesEpoch;
}

function attachWorktreeFilesEpoch(snapshot: InventorySnapshot): InventorySnapshot {
  const { files, inputFilesEpoch } = buildWorktreeFileRecords(snapshot);
  saveWorktreeFilesState(files, inputFilesEpoch);
  return { ...snapshot, inputFilesEpoch };
}

function tryReadWorktreeCache(
  cacheKey: string,
  profile: 'full' | 'timeline',
  inputFilesEpoch: string,
): InventorySnapshot | undefined {
  const cached = readCachedForProfile(cacheKey, profile);
  if (!cached || !worktreeCacheHit(cached, inputFilesEpoch)) return undefined;
  if (profile === 'full' && isFullSnapshot(cached)) return cached;
  if (profile === 'timeline' && (isTimelineSnapshot(cached) || isFullSnapshot(cached))) return cached;
  return undefined;
}

/** Resolve inventory for worktree (disk read + cache under {@link WORKTREE_CACHE_KEY}). */
export function getWorktreeSnapshot(options: CacheOptions = {}): SnapshotResult {
  const source = readWorktreeSource();
  const profile = resolveProfile(options);
  const reader = createWorktreeReader();
  const cacheKey = WORKTREE_CACHE_KEY;
  const filesState = loadWorktreeFilesState();
  const pathsToScan = resolveTrackedPathsForRead(filesState);
  const currentRecords = scanCurrentFileRecords(pathsToScan);

  if (shouldReadCache(options) && currentRecords) {
    const storedMatches = !filesState || fileRecordsMatch(filesState.files, currentRecords);
    if (storedMatches) {
      const inputFilesEpoch = computeInputFilesEpoch(currentRecords);
      const cached = tryReadWorktreeCache(cacheKey, profile, inputFilesEpoch);
      if (cached) {
        return { snapshot: cached, cache: 'hit', barrelPath: getRootIndexRepoPath() };
      }
    }
  }

  const buildSnapshotForProfile = () =>
    profile === 'timeline'
      ? buildTimelineSnapshot({ sha: cacheKey, refLabel: 'working tree', source })
      : buildSnapshot({ sha: cacheKey, refLabel: 'working tree', source, reader });

  if (!shouldWriteCache(options)) {
    return {
      snapshot: buildSnapshotForProfile(),
      cache: rebuildCacheStatus(options),
      barrelPath: getRootIndexRepoPath(),
    };
  }

  const meta = loadCacheMeta();

  if (profile === 'timeline') {
    const snapshot = attachWorktreeFilesEpoch(
      buildTimelineSnapshot({ sha: cacheKey, refLabel: 'working tree', source }),
    );
    persistTimelineSnapshot(cacheKey, 'working tree', snapshot, meta);
    return { snapshot, cache: rebuildCacheStatus(options), barrelPath: getRootIndexRepoPath() };
  }

  const built = buildSnapshot({ sha: cacheKey, refLabel: 'working tree', source, reader });
  const snapshot = attachWorktreeFilesEpoch(built);
  persistSnapshot(cacheKey, 'working tree', snapshot, 'full', meta);
  return { snapshot, cache: rebuildCacheStatus(options), barrelPath: getRootIndexRepoPath() };
}
