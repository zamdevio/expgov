/**
 * Public SDK barrel — governance rules demonstrated here:
 *
 * 1. **Stable** values/types may be flat re-exports (`greet`, `GreetOptions`, …).
 * 2. **Internal** / **advanced** modules are namespace exports so maintainer/experimental
 *    symbols are not flat on the root (validate blocks those policies on root flats).
 *
 * Run `expgov inventory` and `expgov validate` after changing exports.
 */
export { greet, formatGreeting, SDK_VERSION, type GreetOptions } from './stable.js';
export * as internal from './internal.js';
export * as advanced from './advanced.js';
