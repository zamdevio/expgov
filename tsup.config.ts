import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'tsup';

const root = path.dirname(fileURLToPath(import.meta.url));
const coreSrc = path.join(root, 'packages/core/src');

function readPackageVersion(packageJsonPath: string): string {
  const version = (JSON.parse(readFileSync(packageJsonPath, 'utf8')) as { version?: string }).version;
  if (!version) {
    throw new Error(`Missing "version" in ${packageJsonPath}`);
  }
  return version;
}

const rootPackageVersion = readPackageVersion(path.join(root, 'package.json'));
const corePackageVersion = readPackageVersion(path.join(root, 'packages/core/package.json'));

export default defineConfig({
  entry: {
    cli: 'packages/cli/bin/cli.ts',
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
    options.define = {
      ...options.define,
      __EXPGOV_CLI_VERSION__: JSON.stringify(rootPackageVersion),
      __EXPGOV_SDK_VERSION__: JSON.stringify(corePackageVersion),
    };
    options.alias = {
      '@expgov/core': coreSrc,
    };
  },
});
