// server-only (not "use server"): only server components and the validated _actions call these,
// so none of them is exposed to the browser as a callable server action
import "server-only";

import { httpClient } from "@/lib/axios/httpClient";
import {
  IAppointment,
  IBookAppointmentPayload,
  IBookAppointmentResult,
  IInitiatePaymentResult,
  IMedicalHistory,
} from "@/types/appointment.types";

// idempotencyKey: one random id per booking attempt; a retry with the same id
// returns the same appointment instead of creating a second one
const idempotencyHeaders = (idempotencyKey?: string) =>
  idempotencyKey ? { headers: { "Idempotency-Key": idempotencyKey } } : undefined;

export const bookAppointment = async (
  payload: IBookAppointmentPayload,
  idempotencyKey?: string,
) => {
  return await httpClient.post<IBookAppointmentResult>(
    "/appointments/book-appointment",
    payload,
    idempotencyHeaders(idempotencyKey),
  );
};
export const bookAppointmentWithPayLater = async (
  payload: IBookAppointmentPayload,
  idempotencyKey?: string,
) => {
  return await httpClient.post<IBookAppointmentResult>(
    "/appointments/book-appointment-with-pay-later",
    payload,
    idempotencyHeaders(idempotencyKey),
  );
};
export const initiateAppointmentPayment = async (appointmentId: string) => {
  return await httpClient.post<IInitiatePaymentResult>(
    `/appointments/initiate-payment/${appointmentId}`,
    {},
  );
};
export const getMyAppointments = async () => {
  return await httpClient.get<IAppointment[]>(
    "/appointments/my-appointments",
  );
};

export const getMySingleAppointment = async (appointmentId: string) => {
  return await httpClient.get<IAppointment>(
    `/appointments/my-single-appointment/${appointmentId}`,
  );
};

// DOCTOR: the patient's health data + report list through one of the doctor's own appointments
export const getMedicalHistory = async (appointmentId: string) => {
  return await httpClient.get<IMedicalHistory>(`/appointments/${appointmentId}/medical-history`);
};
