"use server";
import { httpClient } from "@/lib/axios/httpClient";
import { IAdminDashboardData } from "@/types/dashboard.types";

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function getDashboardData() {
  try {
    const response = await httpClient.get<IAdminDashboardData>("/stats");
    return response;
  } catch (error: any) {
    console.log(error, "Error from dashboard service");
    return {
      success: false,
      message: error.message || "Something went wrong",
      data: null,
      meta: null,
    };
  }
}
