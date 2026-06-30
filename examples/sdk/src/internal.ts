/** Maintainer helpers — keep behind `export * as internal` on the root barrel. */

export function _internalHelper(): string {
  return 'underscore prefix → internal tier';
}

export function internalDiag(): string {
  return 'internal* prefix → internal tier';
}
