import { afterEach, describe, expect, it } from 'vitest';

import { clearProjectContext, initProjectContextFromConfig } from '../../context/index.js';
import { buildLightSnapshot } from '../../inventory/build.js';
import {
  computeTimelineStepMeta,
  formatTimelineStepShorthand,
  hasTimelineStepActivity,
} from '../../timeline/stepMeta.js';
import type { ExpgovConfig } from '../../types/config/index.js';
import { ExpgovTmpFixture } from './helpers/tmpFixture.js';

const miniConfig: ExpgovConfig = {
  packageName: '@test/pkg',
  core: {
    dir: 'packages/core',
    rootBarrel: 'packages/core/src/index.ts',
    subpaths: { '.': 'src/index.ts' },
  },
};

let fixture: ExpgovTmpFixture | null = null;

afterEach(() => {
  clearProjectContext();
  fixture?.cleanup();
  fixture = null;
});

function initFixture(): void {
  fixture = new ExpgovTmpFixture('timeline-step-meta');
  initProjectContextFromConfig(miniConfig, fixture.root);
}

function lightSnapshot(sha: string, source: string) {
  return buildLightSnapshot({ sha, refLabel: sha.slice(0, 7), source });
}

describe('computeTimelineStepMeta', () => {
  it('diffs flat export names chronologically (older → newer)', () => {
    initFixture();
    const older = lightSnapshot(
      'b'.repeat(40),
      "export { keep, drop } from './x.js';\n",
    );
    const newer = lightSnapshot(
      'a'.repeat(40),
      "export { keep, added } from './x.js';\n",
    );

    const step = computeTimelineStepMeta(older, newer);
    expect(step.added).toBe(1);
    expect(step.removed).toBe(1);
    expect(step.added + step.removed).toBeGreaterThan(0);
  });

  it('tracks namespace and tier count deltas toward the newer commit', () => {
    initFixture();
    const older = lightSnapshot(
      'd'.repeat(40),
      "export { foo, bar } from './x.js';\n",
    );
    const newer = lightSnapshot(
      'c'.repeat(40),
      "export { foo } from './x.js';\nexport * as ns from './ns.js';\n",
    );

    const step = computeTimelineStepMeta(older, newer);
    expect(step.namespaceDelta).toBe(1);
    expect(step.removed).toBe(1);
    expect(step.added).toBe(0);
  });
});

describe('formatTimelineStepShorthand', () => {
  it('omits zero fields', () => {
    const text = formatTimelineStepShorthand({
      added: 2,
      removed: 1,
      namespaceDelta: 0,
      subpathDelta: 0,
      tierDelta: { stable: 1 },
    });
    expect(text).toBe('+2 −1 st +1');
  });

  it('detects activity', () => {
    expect(
      hasTimelineStepActivity({
        added: 0,
        removed: 0,
        namespaceDelta: 0,
        subpathDelta: 0,
        tierDelta: {},
      }),
    ).toBe(false);
  });
});
