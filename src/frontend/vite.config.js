import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  },
  build: {
    sourcemap: true
  },
  resolve: {
    preserveSymlinks: true
  },
  test: {
    include: ['**/*.test.tsx', '**/*.test.ts'],
    globals: true,
    environment: 'jsdom',
    setupFiles: 'src/tests/setup-tests.ts'
  },
  optimizeDeps: { exclude: ['@shared'] },
});
