"use server";
import { callAuthApi } from "@/services/auth.service";
import { ApiErrorResponse } from "@/types/api.types";
import { IRegisterResponse } from "@/types/auth.types";
import { IRegisterPayload, registerZodSchema } from "@/zod/auth.validation";
import { redirect } from "next/navigation";

// Registration does not log the user in: they verify the email, then log in.
export const registerAction = async (
  payload: IRegisterPayload,
): Promise<ApiErrorResponse> => {
  const parsePayload = registerZodSchema.safeParse(payload);
  if (!parsePayload.success) {
    return {
      success: false,
      message: parsePayload.error.issues[0]?.message || "Invalid payload",
    };
  }
  try {
    const result = await callAuthApi<IRegisterResponse>("register", parsePayload.data);
    if (!result.ok) {
      return { success: false, message: result.message };
    }
  } catch (error) {
    console.error("Auth API request failed:", error);
    return { success: false, message: "Could not reach the server. Please try again." };
  }
  redirect(`/verify-email?email=${encodeURIComponent(parsePayload.data.email)}&sent=1`);
};
