import process from 'node:process';

/** True when ANSI color should be disabled (flag, NO_COLOR, or non-TTY). */
export function resolveNoColor(cliNoColor: boolean, env: NodeJS.ProcessEnv = process.env): boolean {
  if (cliNoColor) return true;
  if (Object.prototype.hasOwnProperty.call(env, 'NO_COLOR')) return true;
  if (!process.stdout.isTTY) return true;
  return false;
}
