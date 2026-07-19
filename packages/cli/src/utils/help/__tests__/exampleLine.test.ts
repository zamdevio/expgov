import { afterEach, describe, expect, it } from 'vitest';
import { configureStyle, style } from '@expgov/core/internal';

import { CLI_NAME } from '../../../constants/cli.js';
import { colorizeHelpText } from '../configureCliHelp.js';
import { styleExampleLine, styleInvocation } from '../exampleLine.js';

afterEach(() => {
  configureStyle(false);
});

function withTaggedStyle<T>(run: () => T): T {
  const identity = (s: string) => s;
  const prev = {
    bold: style.bold,
    dim: style.dim,
    accent: style.accent,
    blue: style.blue,
    magenta: style.magenta,
    highlight: style.highlight,
  };
  Object.assign(style, {
    bold: identity,
    dim: (s: string) => `[dim]${s}`,
    accent: (s: string) => `[cyan]${s}`,
    blue: (s: string) => `[blue]${s}`,
    magenta: (s: string) => `[magenta]${s}`,
    highlight: (s: string) => `[hl]${s}`,
  });
  try {
    return run();
  } finally {
    Object.assign(style, prev);
  }
}

describe('styleInvocation / styleExampleLine', () => {
  it('preserves plain text and spacing under --no-color', () => {
    configureStyle(true);
    expect(styleInvocation(`${CLI_NAME} validate [options]`)).toBe(`${CLI_NAME} validate [options]`);
    expect(styleExampleLine(`${CLI_NAME} validate -j`)).toBe(`  ${CLI_NAME} validate -j`);
    expect(styleExampleLine(`${CLI_NAME} diff v1.0.0..HEAD --fail-on-removed`)).toBe(
      `  ${CLI_NAME} diff v1.0.0..HEAD --fail-on-removed`,
    );
  });

  it('styles binary blue, command cyan, and flags dim', () => {
    const out = withTaggedStyle(() => styleExampleLine(`${CLI_NAME} validate -j`));
    expect(out).toBe('  [blue]expgov [cyan]validate [dim]-j');
  });

  it('dims placeholders and keeps refs before the first flag as command path', () => {
    const out = withTaggedStyle(() => styleInvocation(`${CLI_NAME} inventory HEAD -v`));
    expect(out).toBe('[blue]expgov [cyan]inventory [cyan]HEAD [dim]-v');
    const usage = withTaggedStyle(() => styleInvocation(`${CLI_NAME} [options] [command]`));
    expect(usage).toBe('[blue]expgov [dim][options] [dim][command]');
  });
});

describe('colorizeHelpText', () => {
  const sample = [
    'Usage: expgov validate [options]',
    '',
    'Examples:',
    '  expgov validate',
    '  expgov validate -j',
    '  expgov diff v1.0.0..HEAD --fail-on-removed',
  ].join('\n');

  it('keeps Usage/Examples structure under --no-color', () => {
    configureStyle(true);
    expect(colorizeHelpText(sample)).toBe(sample);
  });

  it('colorizes Usage and Examples with the token hierarchy', () => {
    const colored = withTaggedStyle(() => colorizeHelpText(sample));
    expect(colored).toContain('[magenta]Usage:');
    expect(colored).toContain('[blue]expgov [cyan]validate [dim][options]');
    expect(colored).toContain('[magenta]Examples:');
    expect(colored).toContain('  [blue]expgov [cyan]validate');
    expect(colored).toContain('  [blue]expgov [cyan]validate [dim]-j');
    expect(colored).toContain(
      '  [blue]expgov [cyan]diff [cyan]v1.0.0..HEAD [dim]--fail-on-removed',
    );
  });
});
