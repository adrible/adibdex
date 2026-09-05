import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      include: [
        'src/lib/pokeapi/**/*.ts',
        'src/lib/session-storage.ts',
        'src/lib/navigation.ts',
        'src/features/catalog/**/*.ts',
        'src/features/evolution/**/*.ts',
      ],
      reporter: ['text', 'html', 'lcov'],
      thresholds: { statements: 80, branches: 65, functions: 75, lines: 80 },
    },
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
});
