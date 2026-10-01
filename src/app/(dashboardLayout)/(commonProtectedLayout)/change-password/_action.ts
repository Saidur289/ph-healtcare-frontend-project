"use server";
import { getDefaultDashboardRoute, UserRole } from "@/lib/authUtils";
import { applyAuthCookies } from "@/lib/cookieUtils";
import { callAuthApi, getUserInfo } from "@/services/auth.service";
import {
  changePasswordZodSchema,
  IChangePasswordPayload,
} from "@/zod/auth.validation";
import { redirect } from "next/navigation";

type TActionResult = { success: boolean; message: string };

export const changePasswordAction = async (
  payload: IChangePasswordPayload,
): Promise<TActionResult> => {
  const parsed = changePasswordZodSchema.safeParse(payload);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message || "Invalid data" };
  }
  const user = await getUserInfo();
  if (!user) {
    redirect("/login?redirect=/change-password");
  }
  try {
    const { currentPassword, newPassword } = parsed.data;
    const result = await callAuthApi(
      "change-password",
      { currentPassword, newPassword },
      { withSession: true },
    );
    if (!result.ok) {
      return { success: false, message: result.message };
    }
    // new session + tokens (other devices were logged out by the API)
    await applyAuthCookies(result.setCookies);
  } catch {
    return { success: false, message: "Could not reach the server. Please try again." };
  }
  redirect(getDefaultDashboardRoute(user.role as UserRole));
};
