import { mergeConfig } from 'vitest/config';
import path from 'node:path';
import viteConfig from './vite.config';

export default mergeConfig(viteConfig, {
  resolve: { alias: { 'virtual:pwa-register/react': path.resolve('src/test/pwaMock.ts') } },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: [
      'tests/unit/**/*.test.ts',
      'tests/integration/**/*.test.ts',
      'tests/integration/**/*.test.tsx',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/content/generated/**', 'src/main.tsx'],
    },
  },
});
