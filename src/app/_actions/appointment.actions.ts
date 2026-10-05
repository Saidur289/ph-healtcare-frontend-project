"use server";

import {
  bookAppointment,
  bookAppointmentWithPayLater,
  initiateAppointmentPayment,
  getMySingleAppointment,
  getMedicalHistory,
} from "@/services/appointment.services";
import { type ApiErrorResponse, type ApiResponse } from "@/types/api.types";
import {
  type IBookAppointmentPayload,
  type IBookAppointmentResult,
  type IInitiatePaymentResult,
  type IMedicalHistory,
} from "@/types/appointment.types";
import { bookAppointmentServerZodSchema } from "@/zod/appointment.validation";

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

// keys are random ids generated in the browser (crypto.randomUUID)
const isValidIdempotencyKey = (key?: string) =>
  key === undefined || /^[A-Za-z0-9_-]{8,100}$/.test(key);

// used by the payment result page to wait for the Stripe webhook
export const getAppointmentPaymentStatusAction = async (
  appointmentId: string,
): Promise<
  | { success: true; status: string; paymentStatus: string }
  | ApiErrorResponse
> => {
  if (!/^[0-9a-f-]{36}$/i.test(appointmentId)) {
    return { success: false, message: "Invalid appointment id" };
  }
  try {
    const result = await getMySingleAppointment(appointmentId);
    return {
      success: true,
      status: String(result.data.status ?? ""),
      paymentStatus: String(result.data.paymentStatus ?? ""),
    };
  } catch (error: unknown) {
    return {
      success: false,
      message: getActionErrorMessage(error, "Could not load the appointment"),
    };
  }
};

export const bookAppointmentAction = async (
  payload: IBookAppointmentPayload,
  idempotencyKey?: string,
): Promise<ApiResponse<IBookAppointmentResult> | ApiErrorResponse> => {
  if (!isValidIdempotencyKey(idempotencyKey)) {
    return { success: false, message: "Invalid request id" };
  }
  const parsedPayload = bookAppointmentServerZodSchema.safeParse(payload);

  if (!parsedPayload.success) {
    return {
      success: false,
      message:
        parsedPayload.error.issues[0]?.message ||
        "Invalid appointment selection",
    };
  }

  try {
    return await bookAppointment(parsedPayload.data, idempotencyKey);
  } catch (error: unknown) {
    return {
      success: false,
      message: getActionErrorMessage(error, "Failed to book appointment"),
    };
  }
};

export const bookAppointmentWithPayLaterAction = async (
  payload: IBookAppointmentPayload,
  idempotencyKey?: string,
): Promise<ApiResponse<IBookAppointmentResult> | ApiErrorResponse> => {
  if (!isValidIdempotencyKey(idempotencyKey)) {
    return { success: false, message: "Invalid request id" };
  }
  const parsedPayload = bookAppointmentServerZodSchema.safeParse(payload);

  if (!parsedPayload.success) {
    return {
      success: false,
      message:
        parsedPayload.error.issues[0]?.message ||
        "Invalid appointment selection",
    };
  }

  try {
    return await bookAppointmentWithPayLater(parsedPayload.data, idempotencyKey);
  } catch (error: unknown) {
    return {
      success: false,
      message: getActionErrorMessage(
        error,
        "Failed to book appointment with pay later",
      ),
    };
  }
};

export const initiateAppointmentPaymentAction = async (
  appointmentId: string,
): Promise<ApiResponse<IInitiatePaymentResult> | ApiErrorResponse> => {
  if (!appointmentId) {
    return {
      success: false,
      message: "Invalid appointment id",
    };
  }

  try {
    return await initiateAppointmentPayment(appointmentId);
  } catch (error: unknown) {
    return {
      success: false,
      message: getActionErrorMessage(error, "Failed to initiate payment"),
    };
  }
};

// DOCTOR: medical history for one of the doctor's own appointments (the API checks ownership
// and status, and audits the read)
export const getMedicalHistoryAction = async (
  appointmentId: string,
): Promise<{ success: true; data: IMedicalHistory } | ApiErrorResponse> => {
  if (!/^[0-9a-f-]{36}$/i.test(appointmentId)) {
    return { success: false, message: "Invalid appointment id" };
  }
  try {
    const result = await getMedicalHistory(appointmentId);
    return { success: true, data: result.data };
  } catch (error: unknown) {
    return {
      success: false,
      message: getActionErrorMessage(error, "Could not load the medical history"),
    };
  }
};
