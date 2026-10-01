"use server";
import { httpClient } from "@/lib/axios/httpClient";

// GET /stats returns a different shape per role (see types/dashboard.types.ts)
export async function getDashboardData<T = unknown>() {
  try {
    return await httpClient.get<T>("/stats");
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong",
      data: null,
      meta: null,
    };
  }
}

export const setMyAvailability = async (isAvailable: boolean) =>
  httpClient.patch<{ id: string; isAvailable: boolean }>("/doctors/me/availability", { isAvailable });
