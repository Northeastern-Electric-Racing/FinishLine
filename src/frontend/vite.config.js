import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';


const reactEnv = {};

Object.keys(process.env).forEach((key) => {
  if (key.startsWith(`VITE_`)) {
    reactEnv[`import.meta.env.${key}`] = process.env[key]
  }
});


export default defineConfig({
  alias: {
    '@': require('path').resolve(__dirname, 'src')
  },
  define: reactEnv,
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
  }
});
