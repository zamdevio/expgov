import { execSync } from 'node:child_process';
import { afterEach, describe, expect, it } from 'vitest';

import { clearProjectContext, initProjectContextFromConfig } from '../../context/index.js';
import { indexVersionTagsByCommit, versionTagsForCommit } from '../../git/versionTags.js';
import {
  formatReleaseMarker,
  resolveDisplayTags,
} from '../../logger/reports/timeline/markers.js';
import { TIMELINE_MARKER_WIDTH } from '../../shared/constants/timeline.js';
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

function git(root: string, command: string): string {
  return execSync(`git -C ${JSON.stringify(root)} ${command}`, { encoding: 'utf8' }).trim();
}

function createGitRepo(): ExpgovTmpFixture {
  const fixture = new ExpgovTmpFixture('timeline-release-markers');
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
  git(fixture.root, 'init -b main');
  git(fixture.root, 'config user.email test@test.com');
  git(fixture.root, 'config user.name test');
  git(fixture.root, 'add .');
  git(fixture.root, 'commit -m "initial"');
  return fixture;
}

afterEach(() => {
  clearProjectContext();
  while (fixtures.length > 0) {
    fixtures.pop()?.cleanup();
  }
});

describe('indexVersionTagsByCommit', () => {
  it('maps version tags to commit SHAs', () => {
    const fixture = createGitRepo();
    initProjectContextFromConfig(miniConfig, fixture.root);

    const initialSha = git(fixture.root, 'rev-parse HEAD');
    git(fixture.root, 'tag v1.0.0');

    fixture.write({ 'packages/core/src/foo.ts': 'export const foo = 2;\n' });
    git(fixture.root, 'add packages/core/src/foo.ts');
    git(fixture.root, 'commit -m "bump foo"');
    git(fixture.root, 'tag v1.1.0');

    const index = indexVersionTagsByCommit();
    expect(versionTagsForCommit(initialSha, index)).toEqual(['v1.0.0']);
    expect(versionTagsForCommit(git(fixture.root, 'rev-parse HEAD'), index)).toEqual(['v1.1.0']);
  });
});

describe('resolveDisplayTags', () => {
  it('returns every tag in verbose mode', () => {
    expect(resolveDisplayTags(['v1.0.0', 'v1.0.1'], true)).toEqual(['v1.0.0', 'v1.0.1']);
  });

  it('returns only the highest tag by default', () => {
    expect(resolveDisplayTags(['v1.0.0', 'v1.0.1'], false)).toEqual(['v1.0.1']);
  });
});

describe('formatReleaseMarker', () => {
  it('renders a dim release divider with fixed width', () => {
    const line = formatReleaseMarker(['v1.1.0']);
    expect(line).toMatch(/v1\.1\.0/);
    expect(line.replace(/\u001b\[[0-9;]*m/g, '')).toHaveLength(7 + TIMELINE_MARKER_WIDTH);
  });

  it('joins multiple tags on one marker line', () => {
    const line = formatReleaseMarker(['v1.0.0', 'v1.0.1']);
    expect(line).toMatch(/v1\.0\.0 · v1\.0\.1/);
  });
});
