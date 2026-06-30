import { execSync } from 'node:child_process';
import { afterEach, describe, expect, it } from 'vitest';

import { clearProjectContext, initProjectContextFromConfig } from '../../context/index.js';
import { listBarrelCommitsByRef } from '../../git/log.js';
import type { ExpgovConfig } from '../../types/config/index.js';
import { formatTimelineRangeHelp, parseTimelineRange } from '../../time/ranges.js';
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

function createGitRepo(files: Record<string, string>): ExpgovTmpFixture {
  const fixture = new ExpgovTmpFixture('timeline-range');
  fixtures.push(fixture);
  fixture.write({
    'packages/core/package.json': JSON.stringify({
      name: '@test/pkg',
      version: '1.0.0',
      exports: { '.': './src/index.ts' },
    }),
    'packages/core/src/index.ts': "export { foo } from './foo.js';\n",
    'packages/core/src/foo.ts': 'export const foo = 1;\n',
    ...files,
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

describe('parseTimelineRange', () => {
  it('keeps time tokens unchanged', () => {
    const range = parseTimelineRange('@4w');
    expect(range?.kind).toBe('time');
    if (range?.kind === 'time') {
      expect(range.label).toBe('@4w');
      expect(range.sinceIso).toMatch(/T/);
    }
  });

  it('parses date ranges before ref ranges', () => {
    const range = parseTimelineRange('2026-06-01..2026-06-14');
    expect(range?.kind).toBe('time');
    if (range?.kind === 'time') {
      expect(range.since).toBe('2026-06-01');
      expect(range.until).toBe('2026-06-14');
    }
  });

  it('documents ref range help lines', () => {
    expect(formatTimelineRangeHelp().join('\n')).toMatch(/v1\.0\.0\.\.HEAD/);
  });
});

describe('parseTimelineRange ref ranges', () => {
  it('parses tag..HEAD and single tag to HEAD', () => {
    const fixture = createGitRepo({});
    initProjectContextFromConfig(miniConfig, fixture.root);

    fixture.write({ 'packages/core/src/foo.ts': 'export const foo = 2;\n' });
    git(fixture.root, 'add packages/core/src/foo.ts');
    git(fixture.root, 'commit -m "bump foo"');
    git(fixture.root, 'tag v1.0.0');

    fixture.write({
      'packages/core/src/index.ts': "export { foo } from './foo.js';\nexport const bar = 1;\n",
    });
    git(fixture.root, 'add packages/core/src/index.ts');
    git(fixture.root, 'commit -m "add bar export"');

    const range = parseTimelineRange('v1.0.0..HEAD');
    expect(range?.kind).toBe('ref');
    if (range?.kind === 'ref') {
      expect(range.label).toBe('v1.0.0..HEAD');
      expect(range.left.label).toBe('v1.0.0');
      expect(range.right.label).toBe('HEAD');
    }

    const single = parseTimelineRange('v1.0.0');
    expect(single?.kind).toBe('ref');
    if (single?.kind === 'ref') {
      expect(single.label).toBe('v1.0.0..HEAD');
    }
  });

  it('lists barrel commits between refs', () => {
    const fixture = createGitRepo({});
    initProjectContextFromConfig(miniConfig, fixture.root);

    const baseSha = git(fixture.root, 'rev-parse HEAD');

    fixture.write({ 'packages/core/src/index.ts': "export { foo } from './foo.js';\nexport const bar = 1;\n" });
    git(fixture.root, 'add packages/core/src/index.ts');
    git(fixture.root, 'commit -m "add bar export"');
    const headSha = git(fixture.root, 'rev-parse HEAD');

    const commits = listBarrelCommitsByRef({ leftSha: baseSha, rightSha: headSha });
    expect(commits).toHaveLength(1);
    expect(commits[0]?.subject).toBe('add bar export');
  });
});
