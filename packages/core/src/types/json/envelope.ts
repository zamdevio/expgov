export type IssueSeverity = 'error' | 'warning' | 'info';

export type Issue = {
  severity: IssueSeverity;
  code: string;
  message: string;
  path?: string;
};

export type ResultMeta = {
  apiVersion: string;
  schemaVersion?: string;
  cwd?: string;
  durationMs?: number;
  command?: string;
};

export type CliJsonEnvelope<K extends string, D> = {
  ok: boolean;
  kind: K;
  data: D;
  issues: Issue[];
  meta: ResultMeta;
};
