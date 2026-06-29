export interface GitRunResult {
  ok: boolean;
  stdout: string;
  stderr: string;
  status: number | null;
  durationMs: number;
}

export interface GitInvocation {
  args: string[];
  ok: boolean;
  durationMs: number;
  status: number | null;
}

export interface GitRunStats {
  invocations: number;
  totalMs: number;
  last?: GitInvocation;
}
