// vitest.config.ts
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
    conditions: ['browser', 'module', 'import'],
  },
  test: {
    include: ['tests/**/*.{test,spec}.{ts,tsx}'],
    environment: 'node',
    environmentMatchGlobs: [['**/*.{test,spec}.tsx', 'jsdom']],
    setupFiles: ['tests/setup/vitest.setup.ts'],
    globals: true,
    css: true,
    coverage: { provider: 'v8' },
  },
})
