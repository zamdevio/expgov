import { readFileSync } from 'node:fs';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import {
  diagnoseDirectBarrelExports,
  diagnoseUnreachableModuleExports,
  listDirectExportDeclarationNames,
  listModuleExportNames,
} from '../../inventory/diagnostics.js';
import { clearProjectContext, initProjectContextFromConfig } from '../../context/index.js';
import {
  ISSUE_INVENTORY_DIRECT_BARREL_EXPORT,
  ISSUE_INVENTORY_UNREACHABLE_MODULE_EXPORTS,
} from '../constants/issues.js';
import { SNAPSHOT_VERSION, TOOL_VERSION } from '../constants/cache.js';
import { emptyTierCounts } from '../../inventory/tierCounts.js';
import type { ExpgovConfig } from '../../types/config/index.js';
import type { InventorySnapshot, InventorySymbol } from '../../types/inventory/index.js';
import type { SourceReader } from '../../types/inventory/source.js';
import { ExpgovTmpFixture } from './helpers/tmpFixture.js';

function memoryReader(files: Record<string, string>): SourceReader {
  return {
    read(repoRelativePath: string) {
      return files[repoRelativePath] ?? null;
    },
  };
}

function flatSym(
  partial: Partial<InventorySymbol> & Pick<InventorySymbol, 'name' | 'sourceModule'>,
): InventorySymbol {
  return {
    tsKind: 'value',
    exportKind: 'flat',
    tier: 'stable',
    category: 'other',
    targetSubpath: '.',
    symbolKind: 'function',
    subpath: '.',
    ...partial,
  };
}

function miniSnapshot(symbols: InventorySymbol[], edges: InventorySnapshot['edges'] = []): InventorySnapshot {
  return {
    version: SNAPSHOT_VERSION,
    toolVersion: TOOL_VERSION,
    sha: 'abc',
    refLabel: 'test',
    generatedAt: new Date().toISOString(),
    sourceFingerprint: 'fp',
    scanDepth: 'full',
    barrel: 'packages/core/src/index.ts',
    summary: {
      root: {
        flat: symbols.length,
        namespace: 0,
        ...emptyTierCounts(),
        byTsKind: { value: symbols.length, type: 0 },
        bySymbolKind: {},
        byCategory: {},
      },
      subpaths: [],
    },
    symbols,
    namespaces: [],
    edges,
  };
}

describe('listDirectExportDeclarationNames', () => {
  it('finds local export decls and ignores re-exports', () => {
    const source = `
export { add } from './math';
export const VERSION = '1.0.0';
export function helper() {}
export type Id = string;
`;
    expect(listDirectExportDeclarationNames(source, 'index.ts')).toEqual([
      'VERSION',
      'helper',
      'Id',
    ]);
  });
});

describe('listModuleExportNames', () => {
  it('includes direct decls and named export clause names', () => {
    const source = `
export function add() {}
export function subtract() {}
export { mul } from './ops';
`;
    expect(listModuleExportNames(source, 'math.ts')).toEqual(['add', 'mul', 'subtract']);
  });
});

describe('diagnoseDirectBarrelExports (ID1)', () => {
  const fixtures: ExpgovTmpFixture[] = [];

  afterEach(() => {
    clearProjectContext();
    while (fixtures.length > 0) fixtures.pop()?.cleanup();
  });

  it('warns on direct barrel export decls', () => {
    const fixture = new ExpgovTmpFixture('id1-barrel');
    fixtures.push(fixture);
    const config: ExpgovConfig = {
      packageName: '@test/pkg',
      core: {
        dir: 'packages/core',
        rootBarrel: 'packages/core/src/index.ts',
        subpaths: { '.': 'src/index.ts' },
      },
    };
    fixture.write({
      'packages/core/package.json': JSON.stringify({ name: '@test/pkg', exports: { '.': './src/index.ts' } }),
      'packages/core/src/index.ts':
        "export { add } from './math.js';\nexport const VERSION = '1';\n",
      'packages/core/src/math.ts': 'export function add() {}\n',
    });
    initProjectContextFromConfig(config, fixture.root);

    const reader: SourceReader = {
      read(repoRelativePath: string) {
        try {
          return readFileSync(path.join(fixture.root, repoRelativePath), 'utf8');
        } catch {
          return null;
        }
      },
    };

    const issues = diagnoseDirectBarrelExports(reader);
    expect(issues).toHaveLength(1);
    expect(issues[0]?.code).toBe(ISSUE_INVENTORY_DIRECT_BARREL_EXPORT);
    expect(issues[0]?.path).toBe('packages/core/src/index.ts');
    expect(issues[0]?.samples).toEqual(['VERSION']);
  });
});

describe('diagnoseUnreachableModuleExports (ID2)', () => {
  it('warns when tracked module has exports not on the inventoriable surface', () => {
    const modulePath = 'packages/core/src/math.ts';
    const snapshot = miniSnapshot(
      [flatSym({ name: 'add', sourceModule: modulePath })],
      [
        {
          kind: 'flat-reexport',
          from: '.',
          symbol: 'add',
          toModule: modulePath,
          targetSubpath: '.',
        },
      ],
    );
    const reader = memoryReader({
      [modulePath]: `
export function add() {}
export function subtract() {}
`,
    });

    const issues = diagnoseUnreachableModuleExports(snapshot, reader);
    expect(issues).toHaveLength(1);
    expect(issues[0]?.code).toBe(ISSUE_INVENTORY_UNREACHABLE_MODULE_EXPORTS);
    expect(issues[0]?.path).toBe(modulePath);
    expect(issues[0]?.samples).toEqual(['subtract']);
    expect(issues[0]?.message).toContain('not reachable');
  });

  it('is quiet when every local export is reachable', () => {
    const modulePath = 'packages/core/src/math.ts';
    const snapshot = miniSnapshot(
      [flatSym({ name: 'add', sourceModule: modulePath })],
      [
        {
          kind: 'flat-reexport',
          from: '.',
          symbol: 'add',
          toModule: modulePath,
          targetSubpath: '.',
        },
      ],
    );
    const reader = memoryReader({
      [modulePath]: 'export function add() {}\n',
    });
    expect(diagnoseUnreachableModuleExports(snapshot, reader)).toEqual([]);
  });
});
