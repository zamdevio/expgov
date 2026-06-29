import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { getWorktreeSnapshot } from '../../cache/store/worktree.js';
import { clearProjectContext, initProjectContextFromConfig } from '../../context/index.js';
import { WORKTREE_CACHE_KEY, WORKTREE_FILES_FILENAME } from '../../shared/constants/cache.js';
import type { ExpgovConfig } from '../../types/config/index.js';
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

const miniPkgJson = JSON.stringify({
  name: '@test/pkg',
  version: '1.0.0',
  exports: { '.': './src/index.ts' },
});

function createMiniRepo(files: Record<string, string> = {}): ExpgovTmpFixture {
  const fixture = new ExpgovTmpFixture('worktree');
  fixtures.push(fixture);
  fixture.write({
    'packages/core/package.json': miniPkgJson,
    'packages/core/src/index.ts': "export { foo } from './foo.js';\n",
    'packages/core/src/foo.ts': 'export const foo = 1;\n',
    ...files,
  });
  initProjectContextFromConfig(miniConfig, fixture.root);
  return fixture;
}

afterEach(() => {
  clearProjectContext();
  while (fixtures.length > 0) {
    fixtures.pop()?.cleanup();
  }
});

describe('getWorktreeSnapshot files index', () => {
  it('hits cache when tracked files are unchanged', () => {
    createMiniRepo();
    const first = getWorktreeSnapshot();
    const second = getWorktreeSnapshot();

    expect(first.cache).not.toBe('hit');
    expect(second.cache).toBe('hit');
    expect(second.snapshot.inputFilesEpoch).toBe(first.snapshot.inputFilesEpoch);
  });

  it('misses after a direct re-export module changes', () => {
    const fixture = createMiniRepo();
    getWorktreeSnapshot();

    writeFileSync(path.join(fixture.root, 'packages/core/src/foo.ts'), 'export const foo = 2;\n', 'utf8');

    expect(getWorktreeSnapshot().cache).not.toBe('hit');
  });

  it('misses after root barrel changes', () => {
    const fixture = createMiniRepo();
    getWorktreeSnapshot();

    writeFileSync(
      path.join(fixture.root, 'packages/core/src/index.ts'),
      "export { foo } from './foo.js';\nexport const bar = 2;\n",
      'utf8',
    );

    expect(getWorktreeSnapshot().cache).not.toBe('hit');
  });

  it('misses when a deep re-export changes but barrels stay the same', () => {
    const fixture = createMiniRepo({
      'packages/core/src/index.ts': "export { foo } from './hop.js';\n",
      'packages/core/src/hop.ts': "export { foo } from './foo.js';\n",
      'packages/core/src/foo.ts': 'export const foo = 1;\n',
    });
    getWorktreeSnapshot();

    writeFileSync(path.join(fixture.root, 'packages/core/src/foo.ts'), 'export const foo = 9;\n', 'utf8');

    const after = getWorktreeSnapshot();
    expect(after.cache).not.toBe('hit');
  });

  it('tracks re-export chain modules in files.json', () => {
    const fixture = createMiniRepo({
      'packages/core/src/index.ts': "export { foo } from './hop.js';\n",
      'packages/core/src/hop.ts': "export { foo } from './foo.js';\n",
      'packages/core/src/foo.ts': 'export const foo = 1;\n',
    });
    getWorktreeSnapshot();

    const filesJson = path.join(fixture.root, '.expgov/cache', WORKTREE_CACHE_KEY, WORKTREE_FILES_FILENAME);
    const state = JSON.parse(readFileSync(filesJson, 'utf8')) as {
      inputFilesEpoch?: string;
      files: Record<string, unknown>;
    };
    expect(state.files['packages/core/src/hop.ts']).toBeTruthy();
    expect(state.files['packages/core/src/foo.ts']).toBeTruthy();
    expect(state.files['packages/core/src/index.ts']).toBeTruthy();
  });
});
