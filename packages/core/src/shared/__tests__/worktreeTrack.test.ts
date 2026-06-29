import { readFileSync } from 'node:fs';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import {
  collectBarrelScanClosure,
  computeInputFilesEpoch,
  fileRecordsMatch,
} from '../../cache/store/worktreeTrack.js';
import { clearProjectContext, initProjectContextFromConfig } from '../../context/index.js';
import type { WorktreeFileRecord } from '../../types/cache/worktreeFiles.js';
import type { ExpgovConfig } from '../../types/config/index.js';
import { ExpgovTmpFixture } from './helpers/tmpFixture.js';

function record(hash: string): WorktreeFileRecord {
  return { hash, size: 1, mtimeMs: 1 };
}

describe('worktreeTrack epoch', () => {
  it('computeInputFilesEpoch is stable for sorted paths', () => {
    const files = {
      'b.ts': record('bbb'),
      'a.ts': record('aaa'),
    };
    const epoch = computeInputFilesEpoch(files);
    expect(epoch).toHaveLength(16);
    expect(computeInputFilesEpoch(files)).toBe(epoch);
  });

  it('computeInputFilesEpoch changes when a file hash changes', () => {
    const before = { 'a.ts': record('aaa') };
    const after = { 'a.ts': record('aab') };
    expect(computeInputFilesEpoch(after)).not.toBe(computeInputFilesEpoch(before));
  });
});

describe('fileRecordsMatch', () => {
  it('matches identical maps', () => {
    const files = { 'a.ts': record('aaa'), 'b.ts': record('bbb') };
    expect(fileRecordsMatch(files, { ...files })).toBe(true);
  });

  it('rejects missing paths', () => {
    const stored = { 'a.ts': record('aaa'), 'b.ts': record('bbb') };
    const current = { 'a.ts': record('aaa') };
    expect(fileRecordsMatch(stored, current)).toBe(false);
  });

  it('rejects hash drift', () => {
    const stored = { 'a.ts': record('aaa') };
    const current = { 'a.ts': record('aab') };
    expect(fileRecordsMatch(stored, current)).toBe(false);
  });
});

describe('collectBarrelScanClosure', () => {
  const fixtures: ExpgovTmpFixture[] = [];

  afterEach(() => {
    clearProjectContext();
    while (fixtures.length > 0) fixtures.pop()?.cleanup();
  });

  it('includes deep re-export targets', () => {
    const fixture = new ExpgovTmpFixture('closure');
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
      'packages/core/src/index.ts': "export { foo } from './hop.js';\n",
      'packages/core/src/hop.ts': "export { foo } from './leaf.js';\n",
      'packages/core/src/leaf.ts': 'export const foo = 1;\n',
    });
    initProjectContextFromConfig(config, fixture.root);

    const paths = collectBarrelScanClosure({
      read(repoRelativePath: string) {
        try {
          return readFileSync(path.join(fixture.root, repoRelativePath), 'utf8');
        } catch {
          return null;
        }
      },
    });

    expect(paths).toContain('packages/core/src/leaf.ts');
    expect(paths).toContain('packages/core/src/hop.ts');
  });
});
