// plan.md 11.10: the zod schemas used by the forms (same rules as the API).
import { describe, expect, it } from "vitest";
import { bookAppointmentServerZodSchema } from "@/zod/appointment.validation";
import {
  changePasswordZodSchema,
  emailOnlyZodSchema,
  loginZodSchema,
  otpSchema,
  passwordSchema,
  registerZodSchema,
  resetPasswordZodSchema,
} from "@/zod/auth.validation";
import { createScheduleFormZodSchema } from "@/zod/schedule.validation";

const firstMessage = (result: { success: boolean; error?: { issues: { message: string }[] } }) =>
  result.success ? null : result.error!.issues[0].message;

describe("passwordSchema (same policy as the API)", () => {
  it.each(["Abcdefg1", "correct horse 9", "Test#Password1"])("accepts %j", (value) => {
    expect(passwordSchema.safeParse(value).success).toBe(true);
  });

  it.each([
    ["Abc1", "at least 8"],
    ["abcdefgh", "number"],
    ["123456780", "letter"],
    ["Password1", "too common"],
    ["PASSWORD123", "too common"],
    ["a1".repeat(65), "at most 128"],
  ])("rejects %j (%s)", (value, reason) => {
    expect(firstMessage(passwordSchema.safeParse(value))).toMatch(new RegExp(reason));
  });
});

describe("loginZodSchema", () => {
  it("needs a valid email and any non-empty password", () => {
    expect(loginZodSchema.safeParse({ email: "a@example.test", password: "x" }).success).toBe(true);
    expect(loginZodSchema.safeParse({ email: "not-an-email", password: "x" }).success).toBe(false);
    expect(firstMessage(loginZodSchema.safeParse({ email: "a@example.test", password: "" }))).toBe("Password is required");
  });

  it("trims the email", () => {
    const result = loginZodSchema.safeParse({ email: "a@example.test", password: "x" });
    expect(result.success && result.data.email).toBe("a@example.test");
  });
});

describe("registerZodSchema", () => {
  const valid = { name: "Rahim Uddin", email: "rahim@example.test", password: "Test#Password1", acceptTerms: true as const };

  it("accepts a complete registration", () => {
    expect(registerZodSchema.safeParse(valid).success).toBe(true);
  });

  it("requires consent to the privacy policy and terms", () => {
    expect(firstMessage(registerZodSchema.safeParse({ ...valid, acceptTerms: false }))).toBe("Please accept the privacy policy and terms");
    expect(registerZodSchema.safeParse({ ...valid, acceptTerms: undefined }).success).toBe(false);
  });

  it("checks the name length after trimming", () => {
    expect(registerZodSchema.safeParse({ ...valid, name: "  A  " }).success).toBe(false);
    expect(registerZodSchema.safeParse({ ...valid, name: "A".repeat(61) }).success).toBe(false);
  });

  it("applies the password policy", () => {
    expect(registerZodSchema.safeParse({ ...valid, password: "password1" }).success).toBe(false);
  });
});

describe("OTP and email-only schemas", () => {
  it("OTP is exactly 6 digits", () => {
    expect(otpSchema.safeParse("123456").success).toBe(true);
    expect(otpSchema.safeParse(" 123456 ").success).toBe(true);
    expect(otpSchema.safeParse("12345").success).toBe(false);
    expect(otpSchema.safeParse("12345a").success).toBe(false);
  });

  it("email-only needs a valid email", () => {
    expect(emailOnlyZodSchema.safeParse({ email: "x@example.test" }).success).toBe(true);
    expect(emailOnlyZodSchema.safeParse({ email: "x" }).success).toBe(false);
  });
});

describe("password reset / change", () => {
  it("reset: the two new passwords must match", () => {
    const base = { email: "a@example.test", otp: "123456", newPassword: "Reset#Password3" };
    expect(resetPasswordZodSchema.safeParse({ ...base, confirmPassword: "Reset#Password3" }).success).toBe(true);
    const mismatch = resetPasswordZodSchema.safeParse({ ...base, confirmPassword: "Other#Password3" });
    expect(firstMessage(mismatch)).toBe("Passwords do not match");
  });

  it("change: the new password must differ from the current one", () => {
    const same = changePasswordZodSchema.safeParse({ currentPassword: "Same#Password1", newPassword: "Same#Password1", confirmPassword: "Same#Password1" });
    expect(firstMessage(same)).toMatch(/different from the current/);
    const ok = changePasswordZodSchema.safeParse({ currentPassword: "Old#Password1", newPassword: "New#Password2", confirmPassword: "New#Password2" });
    expect(ok.success).toBe(true);
  });
});

describe("booking and schedules", () => {
  it("booking needs UUIDs", () => {
    const id = "0190b5a0-0000-7000-8000-000000000000";
    expect(bookAppointmentServerZodSchema.safeParse({ doctorId: id, scheduleId: id }).success).toBe(true);
    expect(bookAppointmentServerZodSchema.safeParse({ doctorId: "1", scheduleId: id }).success).toBe(false);
  });

  it("schedule: end date/time must be after the start", () => {
    const base = { startDate: "2030-01-01", endDate: "2030-01-02", startTime: "09:00", endTime: "12:00" };
    expect(createScheduleFormZodSchema.safeParse(base).success).toBe(true);
    expect(firstMessage(createScheduleFormZodSchema.safeParse({ ...base, endDate: "2029-12-31" }))).toMatch(/End date/);
    expect(firstMessage(createScheduleFormZodSchema.safeParse({ ...base, endTime: "08:00" }))).toMatch(/End time/);
    expect(createScheduleFormZodSchema.safeParse({ ...base, startTime: "24:00" }).success).toBe(false);
  });
});
