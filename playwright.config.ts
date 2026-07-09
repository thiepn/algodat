import { defineConfig, devices } from '@playwright/test';

const baseURL = 'http://127.0.0.1:4173/algodat/';

export default defineConfig({
  testDir: './tests/e2e',
  globalSetup: './tests/e2e/global-setup.ts',
  fullyParallel: false,
  retries: 0,
  reporter: [['list']],
  use: { baseURL, trace: 'retain-on-failure' },
  projects: [
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobil-chromium', use: { ...devices['Pixel 5'] } },
  ],
});
