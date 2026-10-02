"use server";

import { httpClient } from "@/lib/axios/httpClient";
import {
  IAppointment,
  IBookAppointmentPayload,
  IBookAppointmentResult,
  IInitiatePaymentResult,
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
