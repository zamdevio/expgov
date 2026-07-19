import { readFileSync } from 'node:fs';
import { getSnapshot, getWorktreeSnapshot } from '../cache/index.js';
import {
  getProjectContext,
  isPackageTsconfigPath,
  packageNamePathPrefix,
  wildcardPackageTsconfigPath,
} from '../context/index.js';
import { ExportError } from '../errors/index.js';
import { evaluateValidateSince } from '../format/index.js';
import { resolveSourceRef } from '../git/index.js';
import { formatTierCountsNote, sumSdkTierCounts, tierCountsFooterFields } from '../inventory/index.js';
import { formatTierTagHint } from '../inventory/tierTagHint.js';
import { computeValidateInsights } from '../insights/index.js';
import { listUnknownPolicyRefs, policyViolatesRootFlat } from '../config/tierPolicy.js';
import { printValidateReport } from '../logger/index.js';
import { refLine } from '../logger/report.js';
import { getCorePkgPath, getRootIndexRepoPath } from '../context/paths.js';
import { beginCommand, finishCommand } from '../runtime/command.js';
import { getRunOptions } from '../runtime/runOptions.js';
import type { ValidateOptions } from '../types/commands/cli.js';
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

function summarizeTierSources(
  symbols: { exportKind: string; tier: string; tierProvenance?: { kind: string; bucket?: string } }[],
): {
  tag: number;
  config: number;
  defaultPrefix: number;
  byBucket: Record<string, number>;
} {
  const byBucket: Record<string, number> = {};
  let tag = 0;
  let config = 0;
  let defaultPrefix = 0;

  for (const sym of symbols) {
    if (sym.exportKind !== 'flat') continue;
    const p = sym.tierProvenance;
    if (!p) continue;
    if (p.kind === 'tag') {
      tag += 1;
      byBucket[sym.tier] = (byBucket[sym.tier] ?? 0) + 1;
      continue;
    }
    if (p.kind === 'default-prefix') {
      defaultPrefix += 1;
    } else {
      config += 1;
    }
    if (p.bucket) byBucket[p.bucket] = (byBucket[p.bucket] ?? 0) + 1;
  }

  return { tag, config, defaultPrefix, byBucket };
}

export function runExportsValidate(options: ValidateOptions = {}): number {
  const timer = beginCommand('validate');
  const violations: string[] = [];
  const notes: string[] = [];
  const advancedFlatSymbols: string[] = [];
  const internalFlatSymbols: string[] = [];

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

  const { snapshot } = getWorktreeSnapshot({ noCache: true });
  const { tierCatalog } = getProjectContext();
  const tierSources = summarizeTierSources(snapshot.symbols);

  let sinceLabel: string | undefined;
  let sinceAdded: string[] | undefined;
  let sinceRemoved: string[] | undefined;
  const sinceIssues: Issue[] = [];

  if (options.since) {
    const baselineRef = resolveSourceRef(options.since);
    if (baselineRef.kind !== 'commit') {
      throw new ExportError(
        `--since requires a commit ref (got working tree alias "${options.since}")`,
        'invalid_range',
        {
          details: {
            since: options.since,
            suggestion: 'Use a tag, branch, or SHA — e.g. `expgov validate --since v1.0.0`.',
          },
        },
      );
    }
    const baseline = getSnapshot(baselineRef);
    const { diff, removal } = evaluateValidateSince(baseline.snapshot, snapshot);
    sinceLabel = `${baselineRef.label} → working tree`;
    sinceAdded = diff.added;
    sinceRemoved = diff.removed;
    sinceIssues.push(...removal.issues);
    if (removal.passed) {
      notes.push(`compat since ${baselineRef.label}: no flat export removals`);
    }
  }

  for (const message of listUnknownPolicyRefs(tierCatalog.entries, tierCatalog.policies)) {
    violations.push(message);
  }

  const rootFlatPolicyBlocks = new Map<string, string[]>();

  for (const sym of snapshot.symbols) {
    if (sym.exportKind !== 'flat') continue;
    if (sym.tier === 'internal') internalFlatSymbols.push(sym.name);
    if (sym.tier === 'advanced') advancedFlatSymbols.push(sym.name);
    if (sym.tier === 'unclassified') {
      violations.push(
        `root flat export "${sym.name}" is unclassified — extend expgov tier config (tiers.<tier>.exact or .prefix, or ${formatTierTagHint()})`,
      );
      continue;
    }
    const entry = tierCatalog.byName.get(sym.tier);
    if (entry && policyViolatesRootFlat(entry.policyRules)) {
      const names = rootFlatPolicyBlocks.get(sym.tier) ?? [];
      names.push(sym.name);
      rootFlatPolicyBlocks.set(sym.tier, names);
    }
  }

  const sdkTiers = sumSdkTierCounts(snapshot);
  notes.push(
    `tier sources: ${formatTierTagHint()}=${tierSources.tag} · config=${tierSources.config} · default-prefix=${tierSources.defaultPrefix}`,
  );
  if (options.verbose) {
    const bucketSummary = Object.entries(tierSources.byBucket)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([bucket, count]) => `${bucket}=${count}`)
      .join(' ');
    if (bucketSummary) notes.push(`tier by bucket: ${bucketSummary}`);
  }
  notes.push(formatTierCountsNote(sdkTiers));

  for (const subpath of snapshot.summary.subpaths) {
    if (subpath.byTier.unclassified > 0) {
      violations.push(
        `${subpath.npmSubpath} has ${subpath.byTier.unclassified} unclassified export(s) — add ${formatTierTagHint()} or tier allowlist`,
      );
    }
    if (options.verbose && subpath.flat > 0) {
      notes.push(formatTierCountsNote(subpath.byTier, subpath.npmSubpath));
    }
  }

  for (const [tier, names] of rootFlatPolicyBlocks) {
    const policy = tierCatalog.byName.get(tier)?.policy;
    violations.push(
      `${names.length} ${tier}-tier (${policy ?? 'restricted'}) symbol(s) still flat on root`,
    );
  }

  const displayViolations = [...violations, ...sinceIssues.map((issue) => issue.message)];
  const passed = displayViolations.length === 0;
  const insights = computeValidateInsights(snapshot, {
    passed,
    verbose: options.verbose,
    internalFlatCount: internalFlatSymbols.length,
    advancedFlatCount: advancedFlatSymbols.length,
  });
  const issues: Issue[] = [
    ...violations.map((message) => ({
      severity: 'error' as const,
      code: 'expgov.validate.violation',
      message,
    })),
    ...sinceIssues,
  ];

  const exitCode = passed ? 0 : 1;
  const sinceData =
    options.since && sinceLabel
      ? {
          since: options.since,
          sinceLabel,
          added: sinceAdded ?? [],
          removed: sinceRemoved ?? [],
        }
      : undefined;

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
          violations: displayViolations,
          notes,
          advancedFlatSymbols,
          internalFlatSymbols,
          sdkTiers,
          insights,
          ...sinceData,
        },
      },
    });
    return exitCode;
  }

  printValidateReport({
    passed,
    violations: displayViolations,
    notes,
    verbose: options.verbose,
    advancedFlatSymbols,
    internalFlatSymbols,
    insights,
    listView: options,
    ref: sinceLabel
      ? `compat ${sinceLabel}`
      : refLine({ kind: 'worktree', label: 'working tree' }, snapshot),
  });

  finishCommand({
    command: 'validate',
    timer,
    status: passed ? 'ok' : 'fail',
    exitCode,
    footer: {
      counts: tierCountsFooterFields(sdkTiers, {
        violations: displayViolations.length,
        ...(sinceRemoved?.length ? { removed: sinceRemoved.length } : {}),
      }),
    },
  });
  return exitCode;
}
