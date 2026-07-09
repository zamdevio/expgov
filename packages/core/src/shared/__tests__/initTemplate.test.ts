import { describe, expect, it } from 'vitest';

import { buildInitConfigTemplate } from '../../init/template.js';
import { detectInitProject } from '../../init/detect.js';
import path from 'node:path';

describe('buildInitConfigTemplate --rich', () => {
  it('indents commented tier arrays with two spaces inside brackets', () => {
    const detection = detectInitProject(path.resolve(import.meta.dirname, '../../../../..'));
    const source = buildInitConfigTemplate(detection, { rich: true });
    expect(source).toContain("from '@expgov/cli/core'");
    expect(source).toContain("      exact: [\n        // 'MyPublicType',");
    expect(source).not.toMatch(/^\s{10}\/\//m);
  });
});
