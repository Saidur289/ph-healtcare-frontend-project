import { z } from "zod";

// Keep these rules identical to server/src/app/module/auth/auth.validation.ts
const COMMON_PASSWORDS = new Set([
  "password",
  "password1",
  "password123",
  "12345678",
  "123456789",
  "1234567890",
  "qwerty123",
  "qwertyuiop",
  "11111111",
  "iloveyou1",
  "admin123",
  "welcome1",
  "abc12345",
  "letmein1",
]);

export const passwordSchema = z
  .string("Password is required")
  .min(8, "Password must be at least 8 characters long")
  .max(128, "Password must be at most 128 characters long")
  .regex(/[A-Za-z]/, "Password must contain at least one letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .refine((value) => !COMMON_PASSWORDS.has(value.toLowerCase()), {
    message: "This password is too common, please choose another one",
  });

const emailSchema = z.email("Please enter a valid email").trim().max(254);

export const otpSchema = z
  .string("Code is required")
  .trim()
  .regex(/^\d{6}$/, "Enter the 6-digit code");

export const loginZodSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required").max(128),
});

export const registerZodSchema = z.object({
  name: z
    .string("Name is required")
    .trim()
    .min(2, "Name must be at least 2 characters long")
    .max(60, "Name must be at most 60 characters long"),
  email: emailSchema,
  password: passwordSchema,
});

export const verifyEmailZodSchema = z.object({
  email: emailSchema,
  otp: otpSchema,
});

export const emailOnlyZodSchema = z.object({
  email: emailSchema,
});

export const resetPasswordZodSchema = z
  .object({
    email: emailSchema,
    otp: otpSchema,
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const changePasswordZodSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required").max(128),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from the current password",
    path: ["newPassword"],
  });

export type ILoginPayload = z.infer<typeof loginZodSchema>;
export type IRegisterPayload = z.infer<typeof registerZodSchema>;
export type IVerifyEmailPayload = z.infer<typeof verifyEmailZodSchema>;
export type IResetPasswordPayload = z.infer<typeof resetPasswordZodSchema>;
export type IChangePasswordPayload = z.infer<typeof changePasswordZodSchema>;
