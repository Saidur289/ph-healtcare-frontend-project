/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import {
  getDefaultDashboardRoute,
  isValidateRedirect,
  UserRole,
} from "@/lib/authUtils";
import { httpClient } from "@/lib/axios/httpClient";
import { setTokenInCookies } from "@/lib/tokenUtils";
import { ApiErrorResponse } from "@/types/api.types";
import { ILoginResponse } from "@/types/auth.types";
import { ILoginPayload, loginZodSchema } from "@/zod/auth.validation";
import { redirect } from "next/navigation";

export const loginAction = async (
  payload: ILoginPayload,
  redirectPath?: string,
): Promise<ILoginResponse | ApiErrorResponse> => {
  const parsePayload = loginZodSchema.safeParse(payload);
  if (!parsePayload.success) {
    const firstError =
      parsePayload.error.issues[0].message || "Invalid payload";
    return { success: false, message: firstError };
  }
  try {
    const response = await httpClient.post<ILoginResponse>(
      "/auth/login",
      parsePayload.data,
    );
    const { accessToken, refreshToken, token, user } = response.data;
    const { email, role, needsPasswordChange } = user;
    await setTokenInCookies("accessToken", accessToken);
    await setTokenInCookies("refreshToken", refreshToken);
    await setTokenInCookies("better-auth.session_token", token, 24 * 60 * 60); // 1 day
    if (needsPasswordChange) {
      redirect(`/reset-password?email=${email}`);
    } else {
      const targetPath =
        redirectPath && isValidateRedirect(redirectPath, role as UserRole)
          ? redirectPath
          : getDefaultDashboardRoute(role as UserRole);
      redirect(targetPath);
    }
  } catch (error: any) {
    // console.log("error in login", error);
    if (
      error &&
      typeof error === "object" &&
      "digest" &&
      typeof error.digest === "string" &&
      error.digest.startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }
    console.log(error.response.data);
    if (
      error &&
      error.response &&
      error.response.data.message === "Email is not verified"
    ) {
      redirect(`/verify-email?email=${payload.email}`);
    }
    return {
      success: false,
      message: (error as Error).message || "Something went wrong",
    };
  }
};
