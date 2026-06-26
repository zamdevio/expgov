import { readFileSync } from 'node:fs';

import { getWorktreeSnapshot } from '../cache/index.js';
import {
  getProjectContext,
  isPackageTsconfigPath,
  packageNamePathPrefix,
  wildcardPackageTsconfigPath,
} from '../context/index.js';
import { sumSdkTierCounts } from '../inventory/index.js';
import { printValidateReport } from '../logger/index.js';
import { getCorePkgPath, getRootIndexRepoPath } from '../paths.js';
import { beginCommand, finishCommand } from '../runtime/command.js';
import { getRunOptions } from '../runtime/runOptions.js';
import type { Issue } from '../types/json/envelope.js';

interface PackageExports {
  [subpath: string]: unknown;
}

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

export interface ValidateOptions {
  since?: string;
  verbose?: boolean;
}

export function runExportsValidate(options: ValidateOptions = {}): number {
  const timer = beginCommand('validate');
  const violations: string[] = [];
  const notes: string[] = [];
  const advancedFlatSymbols: string[] = [];
  const internalFlatSymbols: string[] = [];
  let tagTierCount = 0;
  let fallbackTierCount = 0;

  const wildcard = wildcardPackageTsconfigPath();
  const corePkgRel = getRootIndexRepoPath().replace(/\/src\/.*$/, '/package.json');

  const exportsField = readCoreExports();
  const npmKeys = new Set(npmExportKeys(exportsField));
  const paths = readRootTsconfigPaths();
  const tsKeys = tsconfigPackagePaths(paths);

  if (paths[wildcard]) {
    violations.push(`tsconfig still has wildcard ${wildcard} (remove wildcard and keep explicit allowlist only)`);
  }

  for (const key of tsKeys) {
    if (key === wildcard) continue;
    if (!npmKeys.has(key)) {
      violations.push(`tsconfig path "${key}" has no matching ${corePkgRel} exports entry`);
    }
  }

  for (const key of npmKeys) {
    if (!paths[key]) {
      violations.push(`npm export "${key}" not represented in root tsconfig paths`);
    }
  }

  if (options.since) {
    notes.push(`--since=${options.since} is reserved for future delta validation (not enforced yet)`);
  }

  const { snapshot } = getWorktreeSnapshot({ noCache: true });
  for (const sym of snapshot.symbols) {
    if (sym.exportKind !== 'flat') continue;
    if (sym.tierSource === 'tag') tagTierCount += 1;
    else fallbackTierCount += 1;
    if (sym.tier === 'internal') internalFlatSymbols.push(sym.name);
    if (sym.tier === 'advanced') advancedFlatSymbols.push(sym.name);
    if (sym.tier === 'unclassified') {
      violations.push(
        `root flat export "${sym.name}" is unclassified — extend expgov tier config (tiers.<tier>.exact or .prefix, or @sdkTier)`,
      );
    }
  }

  const sdkTiers = sumSdkTierCounts(snapshot);
  notes.push(`root tier sources: tagged=${tagTierCount} fallback=${fallbackTierCount}`);
  notes.push(
    `sdk-wide tiers: stable=${sdkTiers.stable} advanced=${sdkTiers.advanced} internal=${sdkTiers.internal} unclassified=${sdkTiers.unclassified}`,
  );

  for (const subpath of snapshot.summary.subpaths) {
    if (subpath.byTier.unclassified > 0) {
      violations.push(
        `${subpath.npmSubpath} has ${subpath.byTier.unclassified} unclassified export(s) — add @sdkTier or stable allowlist`,
      );
    }
    if (options.verbose && subpath.flat > 0) {
      notes.push(
        `${subpath.npmSubpath}: flat=${subpath.flat} stable=${subpath.byTier.stable} advanced=${subpath.byTier.advanced} internal=${subpath.byTier.internal}`,
      );
    }
  }

  if (internalFlatSymbols.length) {
    violations.push(`${internalFlatSymbols.length} internal-tier symbol(s) still flat on root`);
  }
  if (advancedFlatSymbols.length) {
    violations.push(`${advancedFlatSymbols.length} advanced-tier symbol(s) still flat on root`);
  }

  const passed = violations.length === 0;
  const issues: Issue[] = violations.map((message) => ({
    severity: 'error',
    code: 'expgov.validate.violation',
    message,
  }));

  const exitCode = passed ? 0 : 1;

  if (getRunOptions().json) {
    finishCommand({
      command: 'validate',
      timer,
      status: passed ? 'ok' : 'fail',
      exitCode,
      json: {
        kind: 'validate',
        ok: passed,
        issues,
        data: {
          passed,
          violations,
          notes,
          advancedFlatSymbols,
          internalFlatSymbols,
          sdkTiers,
        },
      },
    });
    return exitCode;
  }

  printValidateReport({
    passed,
    violations,
    notes,
    verbose: options.verbose,
    advancedFlatSymbols,
    internalFlatSymbols,
  });

  finishCommand({
    command: 'validate',
    timer,
    status: passed ? 'ok' : 'fail',
    exitCode,
    footer: {
      counts: {
        violations: violations.length,
        stable: sdkTiers.stable,
        unclassified: sdkTiers.unclassified,
      },
    },
  });
  return exitCode;
}
