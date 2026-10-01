"use server";
import { clearAuthCookies } from "@/lib/cookieUtils";
import { callAuthApi } from "@/services/auth.service";
import {
  IResetPasswordPayload,
  resetPasswordZodSchema,
} from "@/zod/auth.validation";
import { redirect } from "next/navigation";

type TActionResult = { success: boolean; message: string };

export const resetPasswordAction = async (
  payload: IResetPasswordPayload,
): Promise<TActionResult> => {
  const parsed = resetPasswordZodSchema.safeParse(payload);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message || "Invalid data" };
  }
  try {
    const { email, otp, newPassword } = parsed.data;
    const result = await callAuthApi("reset-password", { email, otp, newPassword });
    if (!result.ok) {
      return { success: false, message: result.message };
    }
  } catch {
    return { success: false, message: "Could not reach the server. Please try again." };
  }
  // the API ended every session; drop any stale cookies on this device too
  await clearAuthCookies();
  redirect("/login?reset=1");
};
