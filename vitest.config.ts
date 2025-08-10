import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['tests/unit/**/*.{test,spec}.{ts,tsx}'],
    globals: true,
    environment: 'node',
    environmentMatchGlobs: [['**/*.test.tsx', 'jsdom']],
    setupFiles: ['tests/setup/vitest.setup.ts'],
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
    },
  },
})
