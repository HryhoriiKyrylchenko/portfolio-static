import { defineConfig, devices } from '@playwright/test';

const PORT = 4300;

/**
 * End-to-end tests against the production Pages build (run `npm run build:pages` first, or use
 * `npm run e2e`), served like GitHub Pages so status codes and deep links match the live site.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 1 : 0,
  reporter: process.env['CI'] ? [['github'], ['list']] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    locale: 'en-US',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    // Hosting checks are plain HTTP requests; one run is enough.
    { name: 'mobile', use: { ...devices['Pixel 7'] }, testIgnore: /hosting\.spec\.ts/ },
  ],
  webServer: {
    command: `node scripts/serve-pages.mjs dist/portfolio-static/browser ${PORT}`,
    url: `http://localhost:${PORT}/`,
    reuseExistingServer: !process.env['CI'],
  },
});
