import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Unit tests (tests/unit). End-to-end tests live in tests/e2e and run with Playwright.
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "jsdom",
    include: ["tests/unit/**/*.test.{ts,tsx}"],
    setupFiles: ["./tests/unit/setup.ts"],
    env: {
      // fake values for the proxy tests
      ACCESS_TOKEN_SECRET: "test-access-token-secret-0123456789abcdef",
      NEXT_PUBLIC_API_BASE_URL: "http://api.test/api/v1",
    },
    coverage: {
      provider: "v8",
      include: ["src/lib/authUtils.ts", "src/proxy.ts", "src/zod/**", "src/components/modules/Auth/**"],
      reporter: ["text-summary", "text"],
    },
  },
});
