import { describe, expect, it } from 'vitest';

import { emptyTierCounts } from '../../../inventory/tierCounts.js';
import { isValidSnapshot, isValidSummary, isValidTierCounts } from '../validation.js';

function minimalRootSummary() {
  return {
    flat: 1,
    namespace: 0,
    ...emptyTierCounts(),
    byTsKind: { value: 1, type: 0 },
    bySymbolKind: {},
    byCategory: {},
  };
}

function minimalSummary() {
  return {
    root: minimalRootSummary(),
    subpaths: [],
  };
}

function minimalSnapshot(summary = minimalSummary()) {
  return {
    version: 1,
    toolVersion: 1,
    sha: 'abc123',
    refLabel: 'v0.0.1',
    generatedAt: new Date().toISOString(),
    barrel: 'packages/core/src/index.ts',
    summary,
    symbols: [],
    namespaces: [],
    edges: [],
  };
}

describe('isValidTierCounts', () => {
  it('accepts empty custom map', () => {
    expect(isValidTierCounts(emptyTierCounts())).toBe(true);
  });

  it('rejects missing custom (legacy cache shape)', () => {
    const { custom: _c, ...legacy } = emptyTierCounts();
    expect(isValidTierCounts(legacy)).toBe(false);
  });
});

describe('isValidSummary', () => {
  it('accepts current summary shape', () => {
    expect(isValidSummary(minimalSummary())).toBe(true);
  });

  it('rejects root summary without custom tier map', () => {
    const root = minimalRootSummary();
    const { custom: _c, ...legacyRoot } = root;
    expect(isValidSummary({ root: legacyRoot, subpaths: [] })).toBe(false);
  });

  it('rejects subpath rollups without byTier.custom', () => {
    const byTier = emptyTierCounts();
    const { custom: _c, ...legacyByTier } = byTier;
    expect(
      isValidSummary({
        root: minimalRootSummary(),
        subpaths: [
          {
            npmSubpath: '@pkg/advanced',
            sourceEntry: 'src/advanced.ts',
            flat: 0,
            namespace: 0,
            byTier: legacyByTier,
          },
        ],
      }),
    ).toBe(false);
  });
});

describe('isValidSnapshot', () => {
  it('accepts a minimal valid snapshot', () => {
    expect(isValidSnapshot(minimalSnapshot())).toBe(true);
  });

  it('rejects legacy snapshots missing summary.root.custom', () => {
    const root = minimalRootSummary();
    const { custom: _c, ...legacyRoot } = root;
    expect(
      isValidSnapshot({
        ...minimalSnapshot(),
        summary: { root: legacyRoot, subpaths: [] } as unknown as ReturnType<typeof minimalSummary>,
      }),
    ).toBe(false);
  });
});
