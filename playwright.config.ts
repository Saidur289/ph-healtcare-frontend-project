import { defineConfig, devices } from "@playwright/test";

// End-to-end tests (tests/e2e). Everything runs locally, nothing needs real secrets:
// - the API from ../server (`npm run e2e:server`): throwaway Postgres, fake Stripe Checkout
//   and Daily.co, emails written to a file (see server/scripts/e2e-server.ts);
// - this app as a production build in .next-e2e, on port 3100.
const API_PORT = 5055;
const FAKES_PORT = 5056;
const WEB_PORT = 3100;
const SERVER_DIR = process.env.E2E_SERVER_DIR ?? "../server";

export default defineConfig({
  testDir: "./tests/e2e",
  // the flows share one database: run them one after another
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  timeout: 90_000,
  expect: { timeout: 15_000 },
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  globalTeardown: "./tests/e2e/global-teardown.ts",
  use: {
    baseURL: `http://localhost:${WEB_PORT}`,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  // locally: the installed Google Chrome (no browser download); CI installs Playwright's Chromium
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"], channel: process.env.CI ? undefined : "chrome" } }],
  webServer: [
    {
      command: `npm --prefix "${SERVER_DIR}" run e2e:server`,
      url: `http://localhost:${API_PORT}/`,
      timeout: 180_000,
      reuseExistingServer: !process.env.CI,
      env: { E2E_API_PORT: String(API_PORT), E2E_FAKES_PORT: String(FAKES_PORT), E2E_FRONTEND_URL: `http://localhost:${WEB_PORT}` },
    },
    {
      command: `npx next build && npx next start -p ${WEB_PORT}`,
      url: `http://localhost:${WEB_PORT}/`,
      timeout: 300_000,
      reuseExistingServer: !process.env.CI,
      env: {
        NEXT_DIST_DIR: ".next-e2e",
        NEXT_PUBLIC_API_BASE_URL: `http://localhost:${API_PORT}/api/v1`,
        // must match ACCESS_TOKEN_SECRET in server/tests/test.env (fake, test-only)
        ACCESS_TOKEN_SECRET: "test-access-token-secret-0123456789abcdef",
      },
    },
  ],
});

