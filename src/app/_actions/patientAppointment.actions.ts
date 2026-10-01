"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { getUserInfo } from "@/services/auth.service";
import { revalidatePath } from "next/cache";
import { z } from "zod";

type TResult = { success: boolean; message: string };

const apiMessage = (error: unknown, fallback: string) => {
  const message = (error as { response?: { data?: { message?: unknown } } })?.response?.data?.message;
  return typeof message === "string" ? message : fallback;
};

const idSchema = z.uuid();
// same limit as the API (appointment.validation.ts)
const reasonSchema = z.string().trim().max(300, "Reason must be at most 300 characters").optional();

const requirePatient = async () => (await getUserInfo())?.role === "PATIENT";

// the API enforces ownership, the 2-hour cutoff and refunds; this only validates input
export const cancelAppointmentAction = async (appointmentId: string, reason?: string): Promise<TResult> => {
  if (!(await requirePatient())) return { success: false, message: "Only patients can cancel here" };
  if (!idSchema.safeParse(appointmentId).success) return { success: false, message: "Invalid appointment" };
  const parsedReason = reasonSchema.safeParse(reason);
  if (!parsedReason.success) return { success: false, message: parsedReason.error.issues[0]?.message ?? "Invalid reason" };
  try {
    await httpClient.patch(`/appointments/change-appointment-status/${appointmentId}`, {
      status: "CANCELED",
      ...(parsedReason.data ? { reason: parsedReason.data } : {}),
    });
    revalidatePath("/dashboard/my-appointments");
    return { success: true, message: "Appointment cancelled" };
  } catch (error) {
    return { success: false, message: apiMessage(error, "Could not cancel the appointment") };
  }
};

export const rescheduleAppointmentAction = async (appointmentId: string, scheduleId: string): Promise<TResult> => {
  if (!(await requirePatient())) return { success: false, message: "Only patients can reschedule" };
  if (!idSchema.safeParse(appointmentId).success || !idSchema.safeParse(scheduleId).success) {
    return { success: false, message: "Choose a new time slot" };
  }
  try {
    await httpClient.patch(`/appointments/reschedule/${appointmentId}`, { scheduleId });
    revalidatePath("/dashboard/my-appointments");
    return { success: true, message: "Appointment moved to the new time" };
  } catch (error) {
    return { success: false, message: apiMessage(error, "Could not reschedule the appointment") };
  }
};
