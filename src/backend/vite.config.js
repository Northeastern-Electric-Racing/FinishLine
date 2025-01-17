import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['**/*.test.ts'],
    globals: true,
    maxConcurrency: 1,
    maxWorkers: 1,
    minWorkers: 1,
  }
});
