// plan.md 11.12 — security: a patient opening the admin area is redirected
import { expect, test } from "@playwright/test";
import { fixture, login } from "./helpers";

test("a patient opening /admin/dashboard is sent to their own dashboard", async ({ page }) => {
  const { patient } = await fixture<{ patient: { email: string; password: string } }>("consultation");
  await login(page, patient.email, patient.password);
  await page.goto("/admin/dashboard");
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.goto("/doctor/dashboard/appointments");
  await expect(page).toHaveURL(/\/dashboard$/);
});

test("a visitor opening a protected page is sent to login (and back afterwards)", async ({ page }) => {
  await page.goto("/dashboard/my-appointments");
  await expect(page).toHaveURL(/\/login\?redirect=%2Fdashboard%2Fmy-appointments$/);
});

test("an external redirect target after login is ignored", async ({ page }) => {
  const { patient } = await fixture<{ patient: { email: string; password: string } }>("consultation");
  await page.goto(`/login?redirect=${encodeURIComponent("https://evil.example/")}`);
  await page.getByLabel("Email").fill(patient.email);
  await page.getByPlaceholder("Enter your password").fill(patient.password);
  await page.getByRole("button", { name: "Log In" }).click();
  await expect(page).toHaveURL(/localhost:3100\/dashboard$/);
});
