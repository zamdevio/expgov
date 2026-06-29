import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@expgov/core': path.join(root, 'packages/core/src/index.ts'),
    },
  },
  test: {
    include: [
      'packages/core/src/**/__tests__/**/*.test.ts',
      'packages/cli/src/**/__tests__/**/*.test.ts',
    ],
  },
});
