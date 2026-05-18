"use server";

import {
  createDoctorSchedule,
  deleteDoctorSchedule,
  updateDoctorSchedule,
} from "@/services/doctorSchedule.services";
import { ApiErrorResponse, ApiResponse } from "@/types/api.types";
import {
  ICreateDoctorSchedulePayload,
  IDoctorSchedule,
  IUpdateDoctorSchedulePayload,
} from "@/types/doctorSchedule.types";
import {
  createDoctorsScheduleServerZodSchema,
  updateDoctorScheduleServerZodSchema,
} from "@/zod/doctorSchedule.validation";

const getActionErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (
    error &&
    typeof error === "object" &&
    "response" in error &&
    error.response &&
    typeof error.response === "object" &&
    "data" in error.response &&
    error.response.data &&
    typeof error.response.data === "object" &&
    "message" in error.response.data &&
    typeof error.response.data.message === "string"
  ) {
    return error.response.data.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallbackMessage;
};
export const createMyDoctorScheduleAction = async (
  payload: ICreateDoctorSchedulePayload,
): Promise<ApiResponse<IDoctorSchedule[]> | ApiErrorResponse> => {
  const parsedPayload = createDoctorsScheduleServerZodSchema.safeParse(payload);
  if (!parsedPayload.success) {
    return {
      success: false,
      message: parsedPayload.error.issues[0]?.message || "Invalid input",
    };
  }
  try {
    return await createDoctorSchedule(parsedPayload.data);
  } catch (error: unknown) {
    return {
      success: false,
      message: getActionErrorMessage(error, "Failed to create schedule"),
    };
  }
};
export const updateMyDoctorScheduleAction = async (
  payload: IUpdateDoctorSchedulePayload,
): Promise<ApiResponse<{ count: number }> | ApiErrorResponse> => {
  const parsedPayload = updateDoctorScheduleServerZodSchema.safeParse(payload);
  if (!parsedPayload.success) {
    return {
      success: false,
      message: parsedPayload.error.issues[0]?.message || "Invalid input",
    };
  }
  try {
    return await updateDoctorSchedule(parsedPayload.data);
  } catch (error: unknown) {
    return {
      success: false,
      message: getActionErrorMessage(error, "Failed to update schedule"),
    };
  }
};
export const deleteMyDoctorScheduleAction = async (
  id: string,
): Promise<ApiResponse<null> | ApiErrorResponse> => {
  if (!id) {
    return {
      success: false,
      message: "Invalid schedule id",
    };
  }
  try {
    return await deleteDoctorSchedule(id);
  } catch (error: unknown) {
    return {
      success: false,
      message: getActionErrorMessage(error, "Failed to delete schedule"),
    };
  }
};
