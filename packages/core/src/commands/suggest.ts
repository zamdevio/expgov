import { getWorktreeSnapshot } from '../cache/index.js';
import type { InventorySnapshot } from '../types/inventory/index.js';
import { formatTierTagHint } from '../inventory/tierTagHint.js';
import { printSuggestReport } from '../logger/index.js';
import { refLine } from '../logger/report.js';
import { beginCommand, finishCommand } from '../runtime/command.js';
import { getRunOptions } from '../runtime/runOptions.js';
import { ISSUE_SUGGEST_UNCLASSIFIED } from '../shared/constants/issues.js';
import type { Issue } from '../types/json/envelope.js';
import type { SuggestCliOptions, TierExactSuggestion } from '../types/commands/cli.js';

function collectTierExactSuggestions(snapshot: InventorySnapshot): TierExactSuggestion {
  const names = new Set<string>();

  for (const sym of snapshot.symbols) {
    if (sym.exportKind !== 'flat') continue;
    if (sym.tier !== 'unclassified') continue;
    names.add(sym.name);
  }

  return {
    bucket: 'stable',
    names: [...names].sort((a, b) => a.localeCompare(b)),
  };
}

export function formatStableExactSnippet(names: string[]): string {
  if (!names.length) return '';
  const lines = names.map((name) => `        ${JSON.stringify(name)},`);
  return ['      exact: [', ...lines, '      ],'].join('\n');
}

export function runSuggest(options: SuggestCliOptions = {}): number {
  const timer = beginCommand('suggest');
  const { snapshot } = getWorktreeSnapshot({ noCache: true });
  const suggestion = collectTierExactSuggestions(snapshot);
  const hasSuggestions = suggestion.names.length > 0;

  const rootUnclassified = snapshot.symbols.filter(
    (sym) => sym.exportKind === 'flat' && sym.tier === 'unclassified',
  ).length;

  const subpathUnclassified = snapshot.summary.subpaths.reduce(
    (sum, subpath) => sum + subpath.byTier.unclassified,
    0,
  );

  const hints: string[] = [];
  if (hasSuggestions) {
    hints.push(`copy names into tiers.stable.exact in expgov.config.ts, or add ${formatTierTagHint()} on declarations`);
    hints.push('run expgov validate after updating tier rules');
  }
  if (options.verbose && subpathUnclassified > 0) {
    hints.push(`${subpathUnclassified} unclassified export(s) on published subpaths (included above)`);
  }

  const issues: Issue[] = hasSuggestions
    ? suggestion.names.map((name) => ({
        severity: 'info',
        code: ISSUE_SUGGEST_UNCLASSIFIED,
        message: `unclassified flat export "${name}" — add to tiers.stable.exact or ${formatTierTagHint()}`,
      }))
    : [];

  const exitCode = hasSuggestions ? 1 : 0;

  if (getRunOptions().json) {
    finishCommand({
      command: 'suggest',
      timer,
      status: hasSuggestions ? 'fail' : 'ok',
      exitCode,
      json: {
        kind: 'suggest',
        ok: !hasSuggestions,
        issues,
        data: {
          hasSuggestions,
          suggestion,
          snippet: formatStableExactSnippet(suggestion.names),
          counts: {
            rootFlat: rootUnclassified,
            subpath: subpathUnclassified,
            total: suggestion.names.length,
          },
          hints,
        },
      },
    });
    return exitCode;
  }

  printSuggestReport({
    suggestion,
    hints,
    verbose: options.verbose,
    ref: refLine({ kind: 'worktree', label: 'working tree' }, snapshot),
    listView: options,
  });

  finishCommand({
    command: 'suggest',
    timer,
    status: hasSuggestions ? 'fail' : 'ok',
    exitCode,
    footer: {
      counts: {
        suggested: suggestion.names.length,
        unclassified: suggestion.names.length,
      },
    },
  });
  return exitCode;
}
