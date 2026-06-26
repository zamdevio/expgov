import { ENV_CI, ENV_EXPGOV_NO_INIT } from '../../constants/cli.js';

export function shouldSkipInteractivePrompts(): boolean {
  const ci = process.env[ENV_CI];
  if (ci === '1' || ci === 'true') return true;
  const noInit = process.env[ENV_EXPGOV_NO_INIT];
  if (noInit === '1' || noInit === 'true') return true;
  if (!process.stdin.isTTY) return true;
  return false;
}
