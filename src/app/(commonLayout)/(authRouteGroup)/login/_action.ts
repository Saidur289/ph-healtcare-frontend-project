import { httpClient } from "@/lib/axios/httpClient";
import { setTokenInCookies } from "@/lib/axios/tokenUtils";
import { ApiErrorResponse } from "@/types/api.types";
import { ILoginResponse } from "@/types/auth.types";
import { ILoginPayload, loginZodSchema } from "@/zod/auth.validation";
import { redirect } from "next/navigation";

export const loginAction = async (
  payload: ILoginPayload,
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
    const { accessToken, refreshToken, token } = response.data;
    await setTokenInCookies("accessToken", accessToken);
    await setTokenInCookies("refreshToken", refreshToken);
    await setTokenInCookies("better-auth.session_token", token, 24 * 60 * 60); // 1 day
    redirect("/dashboard");
  } catch (error) {
    console.log("error in login", error);
    return {
      success: false,
      message: (error as Error).message || "Something went wrong",
    };
  }
};
