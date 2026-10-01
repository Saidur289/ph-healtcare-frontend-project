"use server";
import {
  getDefaultDashboardRoute,
  isValidateRedirect,
  UserRole,
} from "@/lib/authUtils";
import { applyAuthCookies } from "@/lib/cookieUtils";
import { callAuthApi } from "@/services/auth.service";
import { ApiErrorResponse } from "@/types/api.types";
import { ILoginResponse } from "@/types/auth.types";
import { ILoginPayload, loginZodSchema } from "@/zod/auth.validation";
import { redirect } from "next/navigation";

export const loginAction = async (
  payload: ILoginPayload,
  redirectPath?: string,
): Promise<ApiErrorResponse> => {
  const parsePayload = loginZodSchema.safeParse(payload);
  if (!parsePayload.success) {
    return {
      success: false,
      message: parsePayload.error.issues[0]?.message || "Invalid payload",
    };
  }

  let target: string;
  try {
    const result = await callAuthApi<ILoginResponse>("login", parsePayload.data);
    if (!result.ok || !result.data?.user) {
      if (result.message === "Email is not verified") {
        // the API has just emailed a new code
        target = `/verify-email?email=${encodeURIComponent(parsePayload.data.email)}`;
      } else {
        return { success: false, message: result.message };
      }
    } else {
      // tokens arrive as Set-Cookie headers from the API; copy them to this site
      await applyAuthCookies(result.setCookies);
      const { role, needPasswordChange } = result.data.user;
      if (needPasswordChange) {
        target = "/change-password?required=1";
      } else {
        target =
          redirectPath && isValidateRedirect(redirectPath, role as UserRole)
            ? redirectPath
            : getDefaultDashboardRoute(role as UserRole);
      }
    }
  } catch {
    return { success: false, message: "Could not reach the server. Please try again." };
  }
  // outside try/catch: redirect() works by throwing
  redirect(target);
};
