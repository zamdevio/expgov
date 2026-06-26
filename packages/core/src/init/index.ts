import type { InitDetection } from './detect.js';
import { detectInitProject } from './detect.js';
import { buildInitConfigTemplate, INIT_CONFIG_FILE_NAME } from './template.js';

export interface InitRunOptions {
  rich?: boolean;
  importSpecifier?: string;
}

export interface InitRunResult {
  proposedConfigSource: string;
  proposedConfigFileName: string;
  detection: InitDetection;
}

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
export { detectInitProject, detectionToConfig, type InitDetection, type InitLayout } from './detect.js';
