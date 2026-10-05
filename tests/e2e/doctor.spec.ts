// plan.md 11.12 — doctor: log in -> pick slots -> start -> complete -> write prescription
import { expect, test } from "@playwright/test";
import { fixture, login } from "./helpers";

type TConsultation = { doctor: { email: string; password: string }; patient: { email: string }; appointmentId: string };

test("a doctor starts a paid consultation, completes it and writes the prescription", async ({ page }) => {
  // a doctor with a PAID appointment whose slot started a minute ago
  const { doctor } = await fixture<TConsultation>("consultation");
  await login(page, doctor.email, doctor.password);
  await expect(page).toHaveURL(/\/doctor\/dashboard$/);

  // start: opening the room moves the appointment to "In progress"
  await page.goto("/doctor/dashboard/appointments");

  // medical history morphs open from its button (read is audited on the API)
  const historyDialog = page.getByRole("dialog", { name: "Medical history" });
  await expect(async () => {
    await page.getByRole("button", { name: "Medical history" }).first().click();
    await expect(historyDialog).toBeVisible({ timeout: 2_000 });
  }).toPass({ timeout: 20_000 });
  await expect(historyDialog.getByText("your access is recorded")).toBeVisible();
  await expect(historyDialog.getByText("The patient has not filled in their health information yet.")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(historyDialog).toBeHidden();

  await page.getByRole("link", { name: "Start call" }).click();
  await expect(page.getByRole("heading", { name: "Consultation with E2E Patient" })).toBeVisible();
  await expect(page.locator('iframe[title="Video consultation"]')).toBeAttached();

  // complete -> prescription form
  await page.getByRole("button", { name: "Complete consultation" }).click();
  await expect(page.getByText("Consultation completed")).toBeVisible();
  await expect(page).toHaveURL(/\/doctor\/dashboard\/prescriptions\?appointmentId=/);

  await expect(page.getByText("New prescription")).toBeVisible();
  await page.getByLabel("Medicine name").first().fill("Paracetamol");
  await page.getByLabel("Dose").first().fill("500 mg");
  await page.getByLabel("Frequency").first().fill("1+0+1");
  await page.getByLabel("Duration").first().fill("5 days");
  await page.getByLabel("Instructions").fill("Rest, drink plenty of water.");
  const followUp = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  await page.getByLabel("Follow-up date").fill(followUp);
  await page.getByRole("button", { name: "Save prescription" }).click();
  await expect(page.getByText("Prescription saved. The patient will receive the PDF by email.")).toBeVisible();

  // the appointment now shows as completed
  await page.goto("/doctor/dashboard/appointments?tab=past");
  await expect(page.getByText("Completed", { exact: true }).first()).toBeVisible();
});

test("a doctor picks slots an admin created", async ({ page }) => {
  // a fresh doctor; the booking fixture also adds a schedule this doctor does not have yet
  const { doctor } = await fixture<TConsultation>("consultation");
  await fixture("doctor-with-slot");
  await login(page, doctor.email, doctor.password);

  await page.goto("/doctor/dashboard/my-schedules");
  const dialog = page.getByRole("dialog", { name: "Book Schedules" });
  // a click before the page has hydrated is lost: retry until the dialog opens
  await expect(async () => {
    await page.getByRole("button", { name: "Book Schedule" }).first().click();
    await expect(dialog).toBeVisible({ timeout: 2_000 });
  }).toPass({ timeout: 20_000 });
  await dialog.getByRole("checkbox").first().check();
  await dialog.getByRole("button", { name: /Book Selected \(1\)/ }).click();
  // the new slot is now offered (open), next to the fixture's booked one
  await expect(dialog).toBeHidden();
  await expect(page.getByText("1 open · 1 booked")).toBeVisible();
});
