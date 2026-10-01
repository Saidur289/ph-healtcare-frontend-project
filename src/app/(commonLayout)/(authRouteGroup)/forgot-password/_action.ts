"use server";
import { callAuthApi } from "@/services/auth.service";
import { emailOnlyZodSchema } from "@/zod/auth.validation";
import { redirect } from "next/navigation";

type TActionResult = { success: boolean; message: string };

export const forgotPasswordAction = async (
  email: string,
): Promise<TActionResult> => {
  const parsed = emailOnlyZodSchema.safeParse({ email });
  if (!parsed.success) {
    return { success: false, message: "Please enter a valid email" };
  }
  try {
    const result = await callAuthApi("forget-password", parsed.data);
    // the API answers the same for unknown emails; only cooldown / server errors fail
    if (!result.ok) {
      return { success: false, message: result.message };
    }
  } catch {
    return { success: false, message: "Could not reach the server. Please try again." };
  }
  redirect(`/reset-password?email=${encodeURIComponent(parsed.data.email)}`);
};
