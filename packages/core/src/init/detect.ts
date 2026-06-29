import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import type { ExpgovConfig } from '../types/config/index.js';
import { DEFAULT_CACHE_DIR } from '../shared/constants/cache.js';
import type { InitDetection } from '../types/init/detection.js';

function readJson<T>(filePath: string): T | null {
  try {
    return JSON.parse(readFileSync(filePath, 'utf8')) as T;
  } catch {
    return null;
  }
}

function firstExportSubpath(exportsField: Record<string, unknown> | undefined): Record<string, string> {
  if (!exportsField || typeof exportsField !== 'object') {
    return { '.': 'src/index.ts' };
  }
  const keys = Object.keys(exportsField);
  if (!keys.length) return { '.': 'src/index.ts' };
  const root = keys.includes('.') ? '.' : keys[0]!;
  const entry = exportsField[root];
  if (typeof entry === 'string') {
    const rel = entry.replace(/^\.\//, '');
    const src = rel.includes('src/') ? rel.split('/').slice(-2).join('/') : 'src/index.ts';
    return { [root]: src.startsWith('src/') ? src : `src/${path.basename(src)}` };
  }
  if (entry && typeof entry === 'object' && 'import' in entry) {
    const imp = (entry as { import?: string }).import ?? '';
    const posix = imp.replace(/^\.\//, '').replace(/\\/g, '/');
    const afterSrc = posix.includes('/src/') ? posix.slice(posix.indexOf('/src/') + 1) : 'src/index.ts';
    return { [root]: afterSrc };
  }
  return { '.': 'src/index.ts' };
}

/** Infer project layout and safe defaults from package.json + on-disk paths. */
export function detectInitProject(repoRoot: string): InitDetection {
  const notes: string[] = [];
  const corePkgPath = path.join(repoRoot, 'packages/core/package.json');
  const coreBarrel = path.join(repoRoot, 'packages/core/src/index.ts');
  const singleBarrel = path.join(repoRoot, 'src/index.ts');
  const rootPkgPath = path.join(repoRoot, 'package.json');

  if (existsSync(corePkgPath) && existsSync(coreBarrel)) {
    const corePkg = readJson<{ name?: string; exports?: Record<string, unknown> }>(corePkgPath);
    const rootPkg = readJson<{ name?: string }>(rootPkgPath);
    const packageName = corePkg?.name ?? rootPkg?.name ?? '@my/sdk';
    notes.push('Detected packages/core monorepo layout.');
    return {
      layout: 'monorepo-core',
      packageName,
      core: {
        dir: 'packages/core',
        rootBarrel: 'packages/core/src/index.ts',
        subpaths: firstExportSubpath(corePkg?.exports),
      },
      rootBarrel: 'packages/core/src/index.ts',
      notes,
    };
  }

  if (existsSync(singleBarrel)) {
    const rootPkg = readJson<{ name?: string; exports?: Record<string, unknown> }>(rootPkgPath);
    const packageName = rootPkg?.name ?? '@my/sdk';
    notes.push('Detected single-package layout (src/index.ts at repo root).');
    return {
      layout: 'single-package',
      packageName,
      core: {
        dir: '.',
        rootBarrel: 'src/index.ts',
        subpaths: firstExportSubpath(rootPkg?.exports),
      },
      rootBarrel: 'src/index.ts',
      notes,
    };
  }

  const rootPkg = readJson<{ name?: string }>(rootPkgPath);
  notes.push('No barrel found — writing monorepo-style defaults (packages/core). Adjust paths after scaffold.');
  return {
    layout: 'generic',
    packageName: rootPkg?.name ? `${rootPkg.name}/core` : '@my/sdk',
    core: {
      dir: 'packages/core',
      rootBarrel: 'packages/core/src/index.ts',
      subpaths: { '.': 'src/index.ts' },
    },
    rootBarrel: 'packages/core/src/index.ts',
    notes,
  };
}

export function detectionToConfig(detection: InitDetection): ExpgovConfig {
  return {
    packageName: detection.packageName,
    core: detection.core,
    tsconfig: 'tsconfig.json',
    cache: { dir: DEFAULT_CACHE_DIR },
    git: {
      tagPattern: 'v*',
      timelineBarrelPath: detection.rootBarrel,
    },
    tiers: {
      stable: { exact: [], prefix: [] },
      internal: { exact: [], prefix: [] },
      advanced: { exact: [], prefix: [] },
    },
  };
}
