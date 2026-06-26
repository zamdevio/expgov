import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'tsup';

const root = path.dirname(fileURLToPath(import.meta.url));
const coreSrc = path.join(root, 'packages/core/src');

export default defineConfig({
  entry: {
    cli: 'packages/cli/bin/expgov.ts',
    core: 'packages/core/src/index.ts',
  },
  format: ['esm'],
  target: 'node20',
  outDir: 'dist',
  clean: true,
  sourcemap: true,
  dts: {
    entry: { core: path.join(coreSrc, 'index.ts') },
    resolve: true,
  },
  splitting: false,
  treeshake: true,
  external: ['commander', 'chalk', 'jiti', 'typescript', '@inquirer/prompts'],
  esbuildOptions(options) {
    options.alias = {
      '@expgov/core': coreSrc,
    };
  },
});
