"use server";
import { callAuthApi } from "@/services/auth.service";
import {
  emailOnlyZodSchema,
  IVerifyEmailPayload,
  verifyEmailZodSchema,
} from "@/zod/auth.validation";
import { redirect } from "next/navigation";

type TActionResult = { success: boolean; message: string };

export const verifyEmailAction = async (
  payload: IVerifyEmailPayload,
): Promise<TActionResult> => {
  const parsed = verifyEmailZodSchema.safeParse(payload);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message || "Invalid code" };
  }
  try {
    const result = await callAuthApi("verify-email", parsed.data);
    if (!result.ok) {
      return { success: false, message: result.message };
    }
  } catch {
    return { success: false, message: "Could not reach the server. Please try again." };
  }
  redirect(`/login?verified=1&email=${encodeURIComponent(parsed.data.email)}`);
};

export const resendVerificationOtpAction = async (
  email: string,
): Promise<TActionResult> => {
  const parsed = emailOnlyZodSchema.safeParse({ email });
  if (!parsed.success) {
    return { success: false, message: "Please enter a valid email" };
  }
  try {
    const result = await callAuthApi("resend-verification-otp", parsed.data);
    return { success: result.ok, message: result.message };
  } catch {
    return { success: false, message: "Could not reach the server. Please try again." };
  }
};
