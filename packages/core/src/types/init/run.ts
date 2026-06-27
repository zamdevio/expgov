import type { InitDetection } from './detection.js';

export interface InitRunOptions {
  rich?: boolean;
  importSpecifier?: string;
}

export interface InitRunResult {
  proposedConfigSource: string;
  proposedConfigFileName: string;
  detection: InitDetection;
}
