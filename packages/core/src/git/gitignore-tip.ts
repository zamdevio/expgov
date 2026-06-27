import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { tryGetProjectContext } from '../context/index.js';
import { coreLogTip } from '../runtime/log.js';
import { canPrintTip } from '../runtime/policy.js';
import { getRunOptions } from '../runtime/runOptions.js';
import {
  DEFAULT_CACHE_DIR,
  EXPGOV_DIR,
  LEGACY_CACHE_DIR,
} from '../shared/constants/cache.js';

function isGitRepo(repoRoot: string): boolean {
  return existsSync(path.join(repoRoot, '.git'));
}

function cacheDirExists(repoRoot: string, cacheRel: string): boolean {
  const cachePath = path.join(repoRoot, cacheRel);
  const expgovRoot = path.join(repoRoot, EXPGOV_DIR);
  const legacyRoot = path.join(repoRoot, '.exports');
  return existsSync(cachePath) || existsSync(expgovRoot) || existsSync(legacyRoot);
}

/** Minimal gitignore matcher — sufficient for cache-dir tips (not a full gitignore implementation). */
function patternMatchesPath(pattern: string, targetPath: string): boolean {
  const pat = pattern.replace(/\\/g, '/').replace(/\/+$/, '');
  const target = targetPath.replace(/\\/g, '/').replace(/\/+$/, '');
  if (!pat || pat.startsWith('!')) return false;
  if (pat === target || pat === `${target}/`) return true;
  if (pat.endsWith('/') && (target === pat.slice(0, -1) || target.startsWith(pat))) return true;
  if (pat.includes('*')) {
    const escaped = pat.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
    return new RegExp(`^${escaped}$`).test(target) || new RegExp(`^${escaped}/`).test(target);
  }
  if (target.startsWith(`${pat}/`) || target === pat) return true;
  const base = path.posix.basename(target);
  return pat === base || pat === `${base}/`;
}

export function gitignoreIgnoresPath(gitignoreContent: string, targetPath: string): boolean {
  const normalized = targetPath.replace(/\\/g, '/');
  const lines = gitignoreContent
    .split('\n')
    .map((line) => line.split('#')[0]!.trim())
    .filter(Boolean);

  for (const line of lines) {
    if (patternMatchesPath(line, normalized)) return true;
    if (line.endsWith('/') && patternMatchesPath(line.slice(0, -1), normalized)) return true;
  }
  return false;
}

export function shouldSuggestCacheGitignore(input: {
  repoRoot: string;
  cacheDirRel: string;
}): boolean {
  if (!isGitRepo(input.repoRoot)) return false;
  if (!cacheDirExists(input.repoRoot, input.cacheDirRel)) return false;

  const gitignorePath = path.join(input.repoRoot, '.gitignore');
  if (!existsSync(gitignorePath)) return true;

  const content = readFileSync(gitignorePath, 'utf8');
  const cacheRel = input.cacheDirRel.replace(/\\/g, '/');
  const checks = [
    cacheRel,
    `${cacheRel}/`,
    EXPGOV_DIR,
    `${EXPGOV_DIR}/`,
    DEFAULT_CACHE_DIR,
    `${DEFAULT_CACHE_DIR}/`,
    '.exports',
    '.exports/',
    LEGACY_CACHE_DIR,
    `${LEGACY_CACHE_DIR}/`,
  ];
  return !checks.some((p) => gitignoreIgnoresPath(content, p));
}

let tipShownThisProcess = false;

/** One actionable tip per process when cache exists but is not gitignored. */
export function maybeEmitCacheGitignoreTip(): void {
  if (tipShownThisProcess) return;
  const run = getRunOptions();
  if (!canPrintTip(run)) return;

  const ctx = tryGetProjectContext();
  if (!ctx) return;

  const cacheRel = path.relative(ctx.repoRoot, ctx.exportsCacheRoot).replace(/\\/g, '/') || DEFAULT_CACHE_DIR;
  if (!shouldSuggestCacheGitignore({ repoRoot: ctx.repoRoot, cacheDirRel: cacheRel })) return;

  tipShownThisProcess = true;
  coreLogTip(
    `Add \`${cacheRel}/\` to .gitignore — expgov warms a local cache there (gitignored in consumer repos).`,
  );
}

export function resetCacheGitignoreTipForTests(): void {
  tipShownThisProcess = false;
}
