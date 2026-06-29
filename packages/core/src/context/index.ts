import path from 'node:path';

import type { ExpgovConfig, ProjectContext } from '../config/types.js';
import type { ExpgovConfigOverrides } from '../config/types.js';
import { resolveTierRules } from '../config/tiers.js';
import { resolveTierTagPolicy } from '../config/tierTag.js';
import { resolveExpgovConfig } from '../config/load.js';
import { DEFAULT_CACHE_DIR } from '../shared/constants/cache.js';

function posixJoin(...parts: string[]): string {
  return path.posix.join(...parts.map((p) => p.replace(/\\/g, '/')));
}

export function buildProjectContext(config: ExpgovConfig, cwd: string): ProjectContext {
  const repoRoot = path.resolve(cwd, config.repoRoot ?? '.');
  const coreDir = path.resolve(repoRoot, config.core.dir);
  const corePkgPath = path.resolve(repoRoot, config.core.packageJson ?? path.join(config.core.dir, 'package.json'));
  const rootIndexRepoPath = config.core.rootBarrel.replace(/\\/g, '/');
  const rootIndexAbsPath = path.resolve(repoRoot, rootIndexRepoPath);
  const exportsCacheRoot = path.resolve(repoRoot, config.cacheDir ?? DEFAULT_CACHE_DIR);
  const tsconfigPath = path.resolve(repoRoot, config.tsconfig ?? 'tsconfig.json');

  const coreDirPosix = config.core.dir.replace(/\\/g, '/');
  const coreSrcPrefix = posixJoin(coreDirPosix, 'src') + '/';

  return {
    packageName: config.packageName,
    repoRoot,
    coreDir,
    corePkgPath,
    coreSrcPrefix,
    rootIndexRepoPath,
    rootIndexAbsPath,
    exportsCacheRoot,
    exportsMetaPath: path.join(exportsCacheRoot, 'meta.json'),
    tsconfigPath,
    subpathSourceEntries: { ...config.core.subpaths },
    git: {
      tagPattern: config.git?.tagPattern ?? 'v*',
      timelineBarrelPath: (config.git?.timelineBarrelPath ?? rootIndexRepoPath).replace(/\\/g, '/'),
    },
    tiers: resolveTierRules(config.tiers),
    tierConfig: config.tiers ?? {},
    tierTag: resolveTierTagPolicy(config.tiers?.tag),
  };
}

let activeContext: ProjectContext | null = null;

export function setProjectContext(ctx: ProjectContext): void {
  activeContext = ctx;
}

export function getProjectContext(): ProjectContext {
  if (!activeContext) {
    throw new Error('ProjectContext not initialized — call initProjectContext() before running commands');
  }
  return activeContext;
}

export function tryGetProjectContext(): ProjectContext | null {
  return activeContext;
}

export function clearProjectContext(): void {
  activeContext = null;
}

export function initProjectContext(overrides: ExpgovConfigOverrides = {}): ProjectContext {
  const { config, cwd } = resolveExpgovConfig(overrides);
  const ctx = buildProjectContext(config, cwd);
  setProjectContext(ctx);
  return ctx;
}

export function initProjectContextFromConfig(config: ExpgovConfig, cwd: string): ProjectContext {
  const ctx = buildProjectContext(config, cwd);
  setProjectContext(ctx);
  return ctx;
}

export function npmSubpathKey(npmSubpathKey: string): string {
  const { packageName } = getProjectContext();
  return npmSubpathKey === '.' ? packageName : `${packageName}/${npmSubpathKey}`;
}

export function packageNamePathPrefix(): string {
  return getProjectContext().packageName;
}

export function isPackageTsconfigPath(key: string): boolean {
  const pkg = getProjectContext().packageName;
  return key === pkg || key.startsWith(`${pkg}/`);
}

export function wildcardPackageTsconfigPath(): string {
  return `${getProjectContext().packageName}/*`;
}
