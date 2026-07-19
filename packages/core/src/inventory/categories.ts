import type { ExportCategory } from '../types/inventory/snapshot.js';
import type { StabilityTier } from '../types/inventory/index.js';
import { CATEGORY_CONTEXT, CATEGORY_RUN_ENTRY } from '../shared/constants/inventory.js';
import { classifySymbolTier } from './tiers.js';

export function classifyExportCategory(name: string, tsKind: 'value' | 'type', exportKind: 'flat' | 'namespace'): ExportCategory {
  if (exportKind === 'namespace') return 'namespace-mirror';
  if (tsKind === 'type') return 'type';
  if (name.startsWith('ISSUE_')) return 'issues';
  if (CATEGORY_RUN_ENTRY.test(name)) return 'run';
  if (name === 'defineConfig' || name === 'loadConfig' || name.startsWith('resolveConfig')) return 'config';
  if (CATEGORY_CONTEXT.test(name)) return 'context';

  const tier = classifySymbolTier(name);
  if (tier === 'advanced') return 'advanced';
  if (tier === 'internal') return 'internal';

  return 'other';
}

/** Map each export category to its intended npm subpath. */
export function targetSubpathFor(category: ExportCategory, name: string): string {
  switch (category) {
    case 'issues':
      return './issues';
    case 'advanced':
      return './advanced';
    case 'internal':
      return './internal';
    case 'run':
    case 'context':
      return '.';
    case 'config':
      return './config';
    case 'namespace-mirror': {
      const domain = name;
      const known = [
        'scan',
        'suggestions',
      ];
      if (known.includes(domain)) return '.';
      return '.';
    }
    case 'type':
      return './types';
    case 'shared':
      return './shared';
    default:
      return '.';
  }
}

export function tierForNamespace(): StabilityTier {
  return 'stable';
}
