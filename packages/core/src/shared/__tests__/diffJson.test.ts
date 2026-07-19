import { afterEach, describe, expect, it } from 'vitest';

import {
  buildDiffJsonListDetail,
  shouldIncludeDiffJsonDetail,
} from '../../format/diffJson.js';
import { clearProjectContext, initProjectContextFromConfig } from '../../context/index.js';
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
  const fixture = new ExpgovTmpFixture('diff-json');
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

function flatSymbol(name: string, tier = 'stable', category: InventorySymbol['category'] = 'other'): InventorySymbol {
  return {
    name,
    tsKind: 'value',
    exportKind: 'flat',
    tier,
    category,
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
    symbols: names.map((n) => flatSymbol(n)),
    namespaces: [],
    edges: [],
  };
}

describe('diffJson detail helpers', () => {
  afterEach(() => {
    clearProjectContext();
    while (fixtures.length) fixtures.pop()?.cleanup();
  });

  it('includes detail under -v, -F, or --names-only', () => {
    expect(shouldIncludeDiffJsonDetail({})).toBe(false);
    expect(shouldIncludeDiffJsonDetail({ verbose: true })).toBe(true);
    expect(shouldIncludeDiffJsonDetail({ full: true })).toBe(true);
    expect(shouldIncludeDiffJsonDetail({ namesOnly: true })).toBe(true);
  });

  it('builds added/removed detail from the correct side snapshots', () => {
    withMiniContext();
    const left = snapshotWithFlats(['alpha', 'beta']);
    const right = snapshotWithFlats(['alpha', 'gamma']);
    const detail = buildDiffJsonListDetail(
      { added: ['gamma'], removed: ['beta'] },
      left,
      right,
    );

    expect(detail.addedDetail).toEqual([
      expect.objectContaining({ name: 'gamma', tier: 'stable', module: 'src/gamma.ts' }),
    ]);
    expect(detail.removedDetail).toEqual([
      expect.objectContaining({ name: 'beta', tier: 'stable', module: 'src/beta.ts' }),
    ]);
    expect(detail.addedDetailHidden).toBe(0);
    expect(detail.removedDetailHidden).toBe(0);
    expect(detail.listGuidance).toEqual({ truncated: false });
  });

  it('applies shared -T list policy to detail rows', () => {
    withMiniContext();
    const added = Array.from({ length: 12 }, (_, i) => `add${String(i).padStart(2, '0')}`);
    const removed = Array.from({ length: 8 }, (_, i) => `rm${String(i).padStart(2, '0')}`);
    const left = snapshotWithFlats(removed);
    const right = snapshotWithFlats(added);
    const truncated = buildDiffJsonListDetail(
      { added, removed },
      left,
      right,
      { top: 3 },
    );

    expect(truncated.top).toBe(3);
    expect(truncated.addedDetail).toHaveLength(3);
    expect(truncated.removedDetail).toHaveLength(3);
    expect(truncated.addedDetailHidden).toBe(9);
    expect(truncated.removedDetailHidden).toBe(5);
    expect(truncated.listGuidance.truncated).toBe(true);
    expect(truncated.listGuidance.note).toContain('addedDetail');
    expect(truncated.listGuidance.note).toContain('removedDetail');

    const full = buildDiffJsonListDetail({ added, removed }, left, right, { full: true });
    expect(full.top).toBe(Infinity);
    expect(full.addedDetail).toHaveLength(12);
    expect(full.removedDetail).toHaveLength(8);
    expect(full.listGuidance).toEqual({ truncated: false });
  });

  it('filters detail rows by --tier without shrinking added/removed name arrays', () => {
    withMiniContext();
    const left = snapshotWithFlats(['keep', 'drop']);
    left.symbols = [
      flatSymbol('keep', 'stable', 'run'),
      flatSymbol('drop', 'internal', 'config'),
    ];
    const right = snapshotWithFlats(['addedStable', 'addedInternal']);
    right.symbols = [
      flatSymbol('addedStable', 'stable', 'run'),
      flatSymbol('addedInternal', 'internal', 'config'),
    ];
    const added = ['addedStable', 'addedInternal'];
    const removed = ['keep', 'drop'];
    const detail = buildDiffJsonListDetail(
      { added, removed },
      left,
      right,
      { full: true, tier: ['stable'] },
    );

    expect(detail.addedDetail.map((r) => (typeof r === 'string' ? r : r.name))).toEqual([
      'addedStable',
    ]);
    expect(detail.removedDetail.map((r) => (typeof r === 'string' ? r : r.name))).toEqual(['keep']);
  });

  it('emits bare name strings with --names-only', () => {
    withMiniContext();
    const left = snapshotWithFlats(['alpha', 'beta']);
    const right = snapshotWithFlats(['alpha', 'gamma']);
    const detail = buildDiffJsonListDetail(
      { added: ['gamma'], removed: ['beta'] },
      left,
      right,
      { namesOnly: true, full: true },
    );
    expect(detail.namesOnly).toBe(true);
    expect(detail.addedDetail).toEqual(['gamma']);
    expect(detail.removedDetail).toEqual(['beta']);
  });
});
