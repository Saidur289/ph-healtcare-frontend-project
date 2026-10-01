"use server";

// Thin API wrappers. The API checks the session, role and ownership on every call;
// pages and components should call the validated actions in app/_actions/consultation.actions.ts.
import { httpClient } from "@/lib/axios/httpClient";
import { IAppointment } from "@/types/appointment.types";
import {
  IJoinCallResult,
  IMedicine,
  IPrescription,
  IReview,
} from "@/types/consultation.types";

export const getJoinDetails = async (appointmentId: string) =>
  httpClient.get<IJoinCallResult>(`/appointments/${encodeURIComponent(appointmentId)}/join`);

export const changeAppointmentStatus = async (
  appointmentId: string,
  status: "INPROGRESS" | "COMPLETED" | "CANCELED" | "NO_SHOW",
  reason?: string,
) =>
  httpClient.patch<IAppointment>(
    `/appointments/change-appointment-status/${encodeURIComponent(appointmentId)}`,
    reason ? { status, reason } : { status },
  );

export const getMyPrescriptions = async () =>
  httpClient.get<IPrescription[]>("/prescriptions/my-prescriptions");

export const createPrescription = async (payload: {
  appointmentId: string;
  followUpDate: string;
  instructions: string;
  medicines: IMedicine[];
}) => httpClient.post<IPrescription>("/prescriptions", payload);

export const createReview = async (payload: {
  appointmentId: string;
  rating: number;
  comment: string;
}) => httpClient.post<IReview>("/reviews", payload);

export const getMyReviews = async () => httpClient.get<IReview[]>("/reviews/my-reviews");
