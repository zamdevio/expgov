import { detectInitProject } from './detect.js';
import { buildInitConfigTemplate } from './template.js';
import { INIT_CONFIG_FILE_NAME } from '../shared/constants/init.js';
import type { InitRunOptions, InitRunResult } from '../types/init/run.js';

export function runInit(repoRoot: string, opts: InitRunOptions = {}): InitRunResult {
  const detection = detectInitProject(repoRoot);
  const proposedConfigSource = buildInitConfigTemplate(detection, {
    rich: opts.rich,
    importSpecifier: opts.importSpecifier,
  });
  return {
    proposedConfigSource,
    proposedConfigFileName: INIT_CONFIG_FILE_NAME,
    detection,
  };
}

export { buildInitConfigTemplate, INIT_CONFIG_FILE_NAME } from './template.js';
export { DEFAULT_INIT_CONFIG_IMPORT } from '../shared/constants/init.js';
export { detectInitProject, detectionToConfig } from './detect.js';
