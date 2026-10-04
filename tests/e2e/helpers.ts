import { expect, type Page } from "@playwright/test";

// test-only endpoints of server/scripts/e2e-server.ts
export const FAKES = "http://127.0.0.1:5056";

// the seeded super admin (server/tests/test.env, fake test-only values)
export const SUPER_ADMIN = { email: "superadmin@example.test", password: "SuperAdmin#Test2026" };

export const uniqueEmail = (prefix: string) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.test`;

export const fixture = async <T>(name: string): Promise<T> => {
  const res = await fetch(`${FAKES}/__e2e/fixtures/${name}`, { method: "POST" });
  if (!res.ok) throw new Error(`fixture ${name} failed: ${res.status}`);
  return (await res.json()) as T;
};

// the verification / reset code from the e2e email outbox
export const otpFor = async (email: string) => {
  for (let i = 0; i < 50; i++) {
    const res = await fetch(`${FAKES}/__e2e/otp?email=${encodeURIComponent(email)}`);
    if (res.ok) return ((await res.json()) as { otp: string }).otp;
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error(`no code emailed to ${email}`);
};

export const login = async (page: Page, email: string, password: string) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByPlaceholder("Enter your password").fill(password);
  await page.getByRole("button", { name: "Log In" }).click();
  await expect(page).not.toHaveURL(/\/login/);
};
