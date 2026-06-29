import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

import {
  getProjectContext,
  isPackageTsconfigPath,
  packageNamePathPrefix,
  wildcardPackageTsconfigPath,
} from '../context/index.js';
import { shouldSuggestCacheGitignore } from '../git/gitignore-tip.js';
import { printDoctorReport } from '../logger/index.js';
import { getCorePkgPath, getRootIndexRepoPath } from '../paths.js';
import { beginCommand, finishCommand } from '../runtime/command.js';
import { getRunOptions } from '../runtime/runOptions.js';
import {
  DEFAULT_CACHE_DIR,
  LEGACY_CACHE_DIR,
} from '../shared/constants/cache.js';
import type { DoctorCliOptions } from '../types/commands/cli.js';
import type { PackageExports } from '../types/config/package.js';
import type { Issue } from '../types/json/envelope.js';

function readCoreExports(): PackageExports {
  const pkg = JSON.parse(readFileSync(getCorePkgPath(), 'utf8')) as { exports?: PackageExports };
  return pkg.exports ?? {};
}

function readRootTsconfigPaths(): Record<string, string[]> {
  const tsconfig = JSON.parse(readFileSync(getProjectContext().tsconfigPath, 'utf8')) as {
    compilerOptions?: { paths?: Record<string, string[]> };
  };
  return tsconfig.compilerOptions?.paths ?? {};
}

function npmExportKeys(exportsField: PackageExports): string[] {
  const pkg = packageNamePathPrefix();
  return Object.keys(exportsField).map((key) => (key === '.' ? pkg : `${pkg}/${key.slice(2)}`));
}

function tsconfigPackagePaths(paths: Record<string, string[]>): string[] {
  return Object.keys(paths).filter((key) => isPackageTsconfigPath(key));
}

function countCacheSnapshots(cacheRoot: string): number {
  if (!existsSync(cacheRoot)) return 0;
  try {
    return readdirSync(cacheRoot).filter((name) => {
      if (name === 'meta.json') return false;
      return statSync(path.join(cacheRoot, name)).isDirectory();
    }).length;
  } catch {
    return 0;
  }
}

function collectParityDrift(): string[] {
  const drift: string[] = [];
  const wildcard = wildcardPackageTsconfigPath();
  const corePkgRel = getRootIndexRepoPath().replace(/\/src\/.*$/, '/package.json');
  const exportsField = readCoreExports();
  const npmKeys = new Set(npmExportKeys(exportsField));
  const paths = readRootTsconfigPaths();
  const tsKeys = tsconfigPackagePaths(paths);

  if (paths[wildcard]) {
    drift.push(`tsconfig still has wildcard ${wildcard} — remove and keep explicit allowlist only`);
  }

  for (const key of tsKeys) {
    if (key === wildcard) continue;
    if (!npmKeys.has(key)) {
      drift.push(`tsconfig path "${key}" has no matching ${corePkgRel} exports entry`);
    }
  }

  for (const key of npmKeys) {
    if (!paths[key]) {
      drift.push(`npm export "${key}" not represented in root tsconfig paths`);
    }
  }

  return drift;
}

export function runExportsDoctor(options: DoctorCliOptions = {}): number {
  const timer = beginCommand('doctor');
  const ctx = getProjectContext();
  const ok: string[] = [];
  const warnings: string[] = [];
  const hints: string[] = [];

  ok.push(`package ${ctx.packageName}`);
  ok.push(`root barrel ${ctx.rootIndexRepoPath}`);

  const cacheRel = path.relative(ctx.repoRoot, ctx.exportsCacheRoot).replace(/\\/g, '/') || DEFAULT_CACHE_DIR;

  if (!ctx.cacheEnabled) {
    ok.push('cache disabled in config (cache.enabled: false)');
  }

  if (!existsSync(ctx.rootIndexAbsPath)) {
    warnings.push(`root barrel missing on disk: ${ctx.rootIndexRepoPath}`);
  } else {
    ok.push(`root barrel file exists`);
  }

  if (!existsSync(ctx.tsconfigPath)) {
    warnings.push(`tsconfig missing: ${path.relative(ctx.repoRoot, ctx.tsconfigPath)}`);
  } else {
    ok.push(`tsconfig ${path.relative(ctx.repoRoot, ctx.tsconfigPath)}`);
  }

  if (!existsSync(ctx.corePkgPath)) {
    warnings.push(`core package.json missing: ${path.relative(ctx.repoRoot, ctx.corePkgPath)}`);
  } else {
    ok.push(`core package.json ${path.relative(ctx.repoRoot, ctx.corePkgPath)}`);
  }

  if (ctx.cacheEnabled) {
    const cacheExists = existsSync(ctx.exportsCacheRoot);
    const snapshotCount = countCacheSnapshots(ctx.exportsCacheRoot);
    if (cacheExists) {
      hints.push(`cache ${cacheRel}/ exists (${snapshotCount} snapshot dir(s))`);
    } else if (options.verbose) {
      hints.push(`cache ${cacheRel}/ not created yet (warms on first inventory/diff run)`);
    }
  } else if (options.verbose) {
    hints.push(`cache dir ${cacheRel}/ configured but writes skipped (cache.enabled: false)`);
  }

  const legacyCachePath = path.join(ctx.repoRoot, LEGACY_CACHE_DIR);
  if (existsSync(legacyCachePath)) {
    warnings.push(
      `legacy cache ${LEGACY_CACHE_DIR}/ still present — remove manually (use cache.dir: ${DEFAULT_CACHE_DIR})`,
    );
  }

  const cacheOnDisk = existsSync(ctx.exportsCacheRoot);
  if (shouldSuggestCacheGitignore({ repoRoot: ctx.repoRoot, cacheDirRel: cacheRel })) {
    warnings.push(`add \`${cacheRel}/\` to .gitignore — local snapshots must not be committed`);
  } else if (cacheOnDisk || existsSync(path.join(ctx.repoRoot, DEFAULT_CACHE_DIR))) {
    ok.push(`cache path gitignored (${cacheRel}/)`);
  }

  const drift = collectParityDrift();
  if (drift.length) {
    for (const line of drift) warnings.push(line);
    hints.push('run expgov validate for full tier + parity enforcement');
  } else {
    ok.push('tsconfig paths ↔ npm exports aligned (no drift)');
  }

  const healthy = warnings.length === 0;
  const issues: Issue[] = warnings.map((message) => ({
    severity: 'warning',
    code: 'expgov.doctor.warning',
    message,
  }));
  const exitCode = healthy ? 0 : 1;
  const snapshotCount = ctx.cacheEnabled ? countCacheSnapshots(ctx.exportsCacheRoot) : 0;

  if (getRunOptions().json) {
    finishCommand({
      command: 'doctor',
      timer,
      status: healthy ? 'ok' : 'fail',
      exitCode,
      json: {
        kind: 'doctor',
        ok: healthy,
        issues,
        data: {
          healthy,
          ok,
          warnings,
          hints,
          cacheRel,
          snapshotCount,
          legacyCachePresent: existsSync(legacyCachePath),
        },
      },
    });
    return exitCode;
  }

  printDoctorReport({ healthy, ok, warnings, hints, verbose: options.verbose });

  finishCommand({
    command: 'doctor',
    timer,
    status: healthy ? 'ok' : 'fail',
    exitCode,
    footer: {
      counts: {
        warnings: warnings.length,
        checks: ok.length,
      },
    },
  });
  return exitCode;
}
