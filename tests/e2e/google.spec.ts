// Google sign-in handoff: the API sends the browser to /auth/google/callback with a single-use code;
// this site exchanges it and sets its own cookies (the API and site are on different domains in production).
import { expect, test } from "@playwright/test";
import { fixture } from "./helpers";

test("a Google sign-in code logs the patient in once, and a reused code is refused", async ({ page }) => {
  const { code } = await fixture<{ code: string; email: string }>("google-code");
  const callback = `/auth/google/callback?code=${code}&redirect=${encodeURIComponent("/dashboard/my-appointments")}`;

  await page.goto(callback);
  await expect(page).toHaveURL(/\/dashboard\/my-appointments$/);
  const cookies = await page.context().cookies();
  expect(cookies.some((c) => c.name === "accessToken")).toBe(true);

  // the same code a second time (e.g. from the browser history) does nothing
  await page.context().clearCookies();
  await page.goto(callback);
  await expect(page).toHaveURL(/\/login\?error=no-session-found/);
  await expect(page.getByText("Google login failed. Please try again.")).toBeVisible();
});

test("a malformed code goes back to login without calling the API", async ({ page }) => {
  await page.goto("/auth/google/callback?code=not-a-code");
  await expect(page).toHaveURL(/\/login\?error=no-session-found/);
});
