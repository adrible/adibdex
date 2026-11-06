import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

export default defineConfig({
  server: { host: '127.0.0.1', port: 8080, strictPort: true },
  plugins: [
    react(),
    {
      name: 'adibdex-static-metadata',
      apply: 'build',
      closeBundle() {
        execFileSync(
          process.execPath,
          [fileURLToPath(new URL('./scripts/generate-metadata-pages.mjs', import.meta.url))],
          { stdio: 'inherit' },
        );
      },
    },
  ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    dedupe: ['react', 'react-dom'],
  },
});
