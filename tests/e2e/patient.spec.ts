// plan.md 11.12 — patient: register -> verify -> book -> pay (test checkout) -> see the appointment
import { expect, test } from "@playwright/test";
import { fixture, otpFor, uniqueEmail } from "./helpers";

test("a new patient registers, verifies, books, pays and sees the appointment", async ({ page }) => {
  const { doctorId } = await fixture<{ doctorId: string }>("doctor-with-slot");
  const email = uniqueEmail("patient");
  const password = "E2e#Password1";

  // register (consent required)
  await page.goto("/register");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Name").fill("Nusrat Jahan");
  await page.getByPlaceholder("Enter your password").fill(password);
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Sign Up" }).click();

  // verify with the emailed code (the email is carried in a cookie, never in the URL)
  await expect(page).toHaveURL(/\/verify-email\?sent=1$/);
  await expect(page.getByLabel("Email")).toHaveValue(email);
  await page.getByLabel("Verification code").fill(await otpFor(email));
  await page.getByRole("button", { name: "Verify email" }).click();

  // log in
  await expect(page).toHaveURL(/\/login\?verified=1$/);
  await page.getByPlaceholder("Enter your password").fill(password);
  if (!(await page.getByLabel("Email").inputValue())) await page.getByLabel("Email").fill(email);
  await page.getByRole("button", { name: "Log In" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);

  // book the doctor's free slot and pay now
  await page.goto(`/consultation/doctor/${doctorId}`);
  await page.getByRole("button", { name: "Book Appointment" }).first().click();
  const dialog = page.getByRole("dialog", { name: "Book Appointment" });
  await dialog.getByRole("button", { name: /Tap to select/ }).first().click();
  await dialog.getByRole("button", { name: "Proceed to Confirm" }).click();

  await expect(page.getByRole("heading", { name: "Confirm Your Appointment" })).toBeVisible();
  await expect(page.getByText("BDT 1,500").first()).toBeVisible();
  await page.getByRole("button", { name: "Confirm & Pay Now" }).click();

  // the (fake) Stripe Checkout page
  await expect(page.getByRole("heading", { name: "Test checkout" })).toBeVisible();
  await expect(page.getByText("Amount: BDT 1500")).toBeVisible();
  await page.getByRole("button", { name: "Pay" }).click();

  // back in the app: the webhook confirmed the payment
  await expect(page).toHaveURL(/\/dashboard\/my-appointments\?payment=success/);
  await expect(page.getByText("Payment successful")).toBeVisible({ timeout: 30_000 });
  await expect(page.getByRole("link", { name: "Dr. E2E Booking Doctor" })).toBeVisible();
  await expect(page.getByText("Paid", { exact: true }).first()).toBeVisible();
});
