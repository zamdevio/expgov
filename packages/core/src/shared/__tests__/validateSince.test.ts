import { afterEach, describe, expect, it } from 'vitest';

import { evaluateValidateSince } from '../../format/validateSince.js';
import { clearProjectContext, initProjectContextFromConfig } from '../../context/index.js';
import { ISSUE_DIFF_EXPORTS_REMOVED } from '../constants/diff.js';
import { SNAPSHOT_VERSION, TOOL_VERSION } from '../constants/cache.js';
import { emptyTierCounts } from '../../inventory/tierCounts.js';
import type { ExpgovConfig } from '../../types/config/index.js';
import type { InventorySnapshot } from '../../types/inventory/snapshot.js';
import type { InventorySymbol } from '../../types/inventory/index.js';
import { ExpgovTmpFixture } from './helpers/tmpFixture.js';

const fixtures: ExpgovTmpFixture[] = [];

const miniConfig: ExpgovConfig = {
  packageName: '@test/pkg',
  core: {
    dir: 'packages/core',
    rootBarrel: 'packages/core/src/index.ts',
    subpaths: { '.': 'src/index.ts' },
  },
  cache: { enabled: true, dir: '.expgov/cache' },
};

function withMiniContext(): void {
  const fixture = new ExpgovTmpFixture('validate-since');
  fixtures.push(fixture);
  fixture.write({
    'packages/core/package.json': JSON.stringify({
      name: '@test/pkg',
      version: '1.0.0',
      exports: { '.': './src/index.ts' },
    }),
    'packages/core/src/index.ts': "export { foo } from './foo.js';\n",
    'packages/core/src/foo.ts': 'export const foo = 1;\n',
  });
  initProjectContextFromConfig(miniConfig, fixture.root);
}

function flatSymbol(name: string): InventorySymbol {
  return {
    name,
    tsKind: 'value',
    exportKind: 'flat',
    tier: 'stable',
    category: 'other',
    targetSubpath: '.',
    symbolKind: 'function',
    sourceModule: `src/${name}.ts`,
    subpath: '.',
  };
}

function snapshotWithFlats(names: string[]): InventorySnapshot {
  return {
    version: SNAPSHOT_VERSION,
    toolVersion: TOOL_VERSION,
    sha: '__test__',
    refLabel: 'test',
    generatedAt: new Date().toISOString(),
    barrel: 'packages/core/src/index.ts',
    summary: {
      root: {
        flat: names.length,
        namespace: 0,
        ...emptyTierCounts(),
        stable: names.length,
        byTsKind: { value: names.length, type: 0 },
        bySymbolKind: {},
        byCategory: {},
      },
      subpaths: [],
    },
    symbols: names.map(flatSymbol),
    namespaces: [],
    edges: [],
  };
}

describe('evaluateValidateSince', () => {
  afterEach(() => {
    clearProjectContext();
    while (fixtures.length) fixtures.pop()?.cleanup();
  });

  it('fails when flat exports were removed since the baseline', () => {
    withMiniContext();
    const baseline = snapshotWithFlats(['alpha', 'beta', 'gamma']);
    const current = snapshotWithFlats(['alpha', 'gamma']);
    const { diff, removal } = evaluateValidateSince(baseline, current);

    expect(diff.removed).toEqual(['beta']);
    expect(diff.added).toEqual([]);
    expect(removal.passed).toBe(false);
    expect(removal.issues).toHaveLength(1);
    expect(removal.issues[0]).toMatchObject({
      severity: 'error',
      code: ISSUE_DIFF_EXPORTS_REMOVED,
      message: '1 flat export removed: beta',
    });
  });

  it('passes when the surface only grew', () => {
    withMiniContext();
    const baseline = snapshotWithFlats(['alpha']);
    const current = snapshotWithFlats(['alpha', 'beta']);
    const { diff, removal } = evaluateValidateSince(baseline, current);

    expect(diff.added).toEqual(['beta']);
    expect(diff.removed).toEqual([]);
    expect(removal.passed).toBe(true);
    expect(removal.issues).toEqual([]);
  });

  it('passes when the flat surface is unchanged', () => {
    withMiniContext();
    const baseline = snapshotWithFlats(['alpha', 'beta']);
    const current = snapshotWithFlats(['beta', 'alpha']);
    const { removal } = evaluateValidateSince(baseline, current);
    expect(removal.passed).toBe(true);
  });
});
