import { CLI_NAME } from '../../constants/cli.js';
import { style } from '@expgov/core/internal';

/** Command-path tokens stop at the first flag or Commander placeholder. */
function isCommandPathToken(token: string): boolean {
  return !token.startsWith('-') && !token.startsWith('[') && !token.startsWith('<');
}

/**
 * Style a command invocation: bold blue binary, bold cyan command path,
 * dim flags / values / placeholders. Preserves token text and single spaces.
 */
export function styleInvocation(text: string): string {
  const tokens = text.trim().split(/\s+/).filter(Boolean);
  if (!tokens.length) return '';

  const out: string[] = [];
  let i = 0;

  if (tokens[0] === CLI_NAME) {
    out.push(style.bold(style.blue(tokens[0]!)));
    i = 1;
  }

  while (i < tokens.length && isCommandPathToken(tokens[i]!)) {
    out.push(style.bold(style.accent(tokens[i]!)));
    i += 1;
  }

  while (i < tokens.length) {
    out.push(style.dim(tokens[i]!));
    i += 1;
  }

  return out.join(' ');
}

/** Colorize one Examples line (leading two spaces). */
export function styleExampleLine(line: string): string {
  return `  ${styleInvocation(line)}`;
}
