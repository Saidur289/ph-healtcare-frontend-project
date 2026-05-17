import {
  createSchedule,
  deleteSchedule,
  getScheduleById,
} from "@/services/schedule.services";
import { ApiErrorResponse, ApiResponse } from "@/types/api.types";
import { ICreateSchedulePayload, ISchedule } from "@/types/schedule.types";
import { createScheduleFormZodSchema } from "@/zod/schedule.validation";

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
export const createScheduleAction = async (
  payload: ICreateSchedulePayload,
): Promise<ApiResponse<ISchedule[]> | ApiErrorResponse> => {
  const parsedPayload = createScheduleFormZodSchema.safeParse(payload);
  if (!parsedPayload.success) {
    return {
      success: false,
      message: parsedPayload.error.issues[0]?.message || "Invalid input",
    };
  }

  try {
    return await createSchedule(parsedPayload.data);
  } catch (error: unknown) {
    return {
      success: false,
      message: getActionErrorMessage(error, "Failed to create schedule"),
    };
  }
};
export const updateScheduleAction = async (
  id: string,
  payload: ICreateSchedulePayload,
): Promise<ApiResponse<ISchedule[]> | ApiErrorResponse> => {
  if (!id) {
    return {
      success: false,
      message: "Invalid schedule id",
    };
  }
  const parsedPayload = createScheduleFormZodSchema.safeParse(payload);
  if (!parsedPayload.success) {
    return {
      success: false,
      message: parsedPayload.error.issues[0]?.message || "Invalid input",
    };
  }

  try {
    return await createSchedule(parsedPayload.data);
  } catch (error: unknown) {
    return {
      success: false,
      message: getActionErrorMessage(error, "Failed to update schedule"),
    };
  }
};
export const deleteScheduleAction = async (
  id: string,
): Promise<ApiResponse<boolean> | ApiErrorResponse> => {
  if (!id) {
    return {
      success: false,
      message: "Invalid schedule id",
    };
  }
  try {
    return await deleteSchedule(id);
  } catch (error: unknown) {
    return {
      success: false,
      message: getActionErrorMessage(error, "Failed to delete schedule"),
    };
  }
};
export const getScheduleByIdAction = async (
  id: string,
): Promise<ApiResponse<ISchedule> | ApiErrorResponse> => {
  if (!id) {
    return {
      success: false,
      message: "Invalid schedule id",
    };
  }
  try {
    return await getScheduleById(id);
  } catch (error: unknown) {
    return {
      success: false,
      message: getActionErrorMessage(error, "Failed to fetch schedule details"),
    };
  }
};
