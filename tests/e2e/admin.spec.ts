// plan.md 11.12 — admin: create doctor -> create schedule -> view payments
import { expect, test } from "@playwright/test";
import { fixture, login, SUPER_ADMIN, uniqueEmail } from "./helpers";

test("an admin creates a doctor and a schedule, and views payments", async ({ page }) => {
  const specialty = await fixture<{ title: string }>("specialty");
  await login(page, SUPER_ADMIN.email, SUPER_ADMIN.password);
  await expect(page).toHaveURL(/\/admin\/dashboard$/);

  // create a doctor
  await page.goto("/admin/dashboard/doctors-management");
  await page.getByRole("button", { name: "Create Doctor" }).click();
  const form = page.getByRole("dialog", { name: "Create Doctor" });
  const email = uniqueEmail("doctor");
  await form.getByLabel("Full Name").fill("Tanvir Hasan");
  await form.getByLabel("Email").fill(email);
  await form.getByPlaceholder("Enter temporary password").fill("Temp#Password1");
  await form.getByLabel("Contact Number").fill("01711000000");
  await form.getByLabel("Registration Number").fill(`BMDC-${Date.now()}`);
  await form.getByLabel("Experience").fill("8");
  await form.getByLabel("Appointment Fee").fill("1200");
  await form.getByLabel("Qualification").fill("MBBS, FCPS");
  await form.getByLabel("Current Working Place").fill("Dhaka Medical College");
  await form.getByLabel("Designation").fill("Consultant");
  await form.getByRole("button", { name: "Select specialties" }).click();
  await page.getByRole("menuitem", { name: specialty.title }).click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("menu")).toBeHidden();
  // the long form refuses Escape and outside clicks, so nothing typed is lost
  await page.keyboard.press("Escape");
  await page.mouse.click(5, 5);
  await expect(form).toBeVisible();
  await expect(form.getByLabel("Full Name")).toHaveValue("Tanvir Hasan");
  await form.getByRole("button", { name: "Create Doctor" }).click();
  await expect(page.getByText(/Doctor created successfully|created/i).first()).toBeVisible();
  await expect(form).toBeHidden();
  await expect(page.getByText(email).first()).toBeVisible();

  // create a schedule for tomorrow, 10:00-11:00 (two 30-minute slots)
  await page.goto("/admin/dashboard/schedules-management");
  await page.getByRole("button", { name: "Create Schedule" }).click();
  const scheduleForm = page.getByRole("dialog", { name: "Create Schedule" });
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  await scheduleForm.getByLabel("Start Date").fill(tomorrow);
  await scheduleForm.getByLabel("End Date").fill(tomorrow);
  await scheduleForm.getByLabel("Start Time").fill("10:00");
  await scheduleForm.getByLabel("End Time").fill("11:00");
  await page.keyboard.press("Escape");
  await expect(scheduleForm).toBeVisible();
  await expect(scheduleForm.getByLabel("Start Date")).toHaveValue(tomorrow);
  await scheduleForm.getByRole("button", { name: "Create Schedule" }).click();
  await expect(page.getByText(/schedules? created successfully/i).first()).toBeVisible();
  await expect(scheduleForm).toBeHidden();

  // payments
  await page.goto("/admin/dashboard/payments-management");
  await expect(page.getByRole("heading", { name: "Payments" })).toBeVisible();
  await expect(page.getByPlaceholder("Search by invoice no., patient or doctor…")).toBeVisible();
});
