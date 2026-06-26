export function resolveNoColor(cliFlag: boolean, env: NodeJS.ProcessEnv = process.env): boolean {
  if (cliFlag) return true;
  return Object.prototype.hasOwnProperty.call(env, 'NO_COLOR');
}
