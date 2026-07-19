import type { Issue } from '../json/envelope.js';

export type DiffFailOptions = {
  failOnRemoved?: boolean;
  failOnTierViolations?: boolean;
};

export type DiffFailEvaluation = {
  passed: boolean;
  issues: Issue[];
};
