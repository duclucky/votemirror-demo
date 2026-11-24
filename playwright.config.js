import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './e2e',
  workers: 1,
  timeout: 45000,
  use: {
    browserName: 'chromium',
    channel: process.env.CI ? 'chromium' : 'chrome',
    baseURL: process.env.DEMO_URL ?? 'http://127.0.0.1:4183',
    viewport: { width: 1440, height: 1000 },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: process.env.DEMO_URL
    ? undefined
    : {
        command: 'npm run dev -- --port 4183 --strictPort',
        url: 'http://127.0.0.1:4183',
        reuseExistingServer: !process.env.CI,
      },
});
