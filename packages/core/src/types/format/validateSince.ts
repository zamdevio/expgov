import type { DiffResult } from './diff.js';
import type { DiffFailEvaluation } from './diffFail.js';

export type ValidateSinceEvaluation = {
  diff: DiffResult;
  removal: DiffFailEvaluation;
};
