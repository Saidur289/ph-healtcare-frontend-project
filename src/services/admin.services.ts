"use server";

// Read-only admin lists. The API checks the ADMIN / SUPER_ADMIN role on every call.
// ("use server" so TanStack Query can call them from the browser; mutations live in
// app/_actions/admin.actions.ts, which validate input first.)
import { httpClient } from "@/lib/axios/httpClient";
import {
  IAdminAppointment,
  IAdminDoctorSchedule,
  IAdminPatient,
  IAdminPayment,
  IAdminPrescription,
  IAdminReview,
  IAdminSpecialty,
  IAdminUser,
} from "@/types/admin.types";

const withQuery = (path: string, queryString: string) => (queryString ? `${path}?${queryString}` : path);

export const getPatientsForAdmin = async (queryString: string) =>
  httpClient.get<IAdminPatient[]>(withQuery("/patients", queryString));

export const getAppointmentsForAdmin = async (queryString: string) =>
  httpClient.get<IAdminAppointment[]>(withQuery("/appointments", queryString));

export const getPaymentsForAdmin = async (queryString: string) =>
  httpClient.get<IAdminPayment[]>(withQuery("/payments", queryString));

export const getReviewsForAdmin = async (queryString: string) =>
  httpClient.get<IAdminReview[]>(withQuery("/reviews", queryString));

export const getPrescriptionsForAdmin = async (queryString: string) =>
  httpClient.get<IAdminPrescription[]>(withQuery("/prescriptions", queryString));

export const getDoctorSchedulesForAdmin = async (queryString: string) =>
  httpClient.get<IAdminDoctorSchedule[]>(withQuery("/doctor-schedules", queryString));

export const getAdmins = async () => httpClient.get<IAdminUser[]>("/admins");

export const getSpecialtiesForAdmin = async () => httpClient.get<IAdminSpecialty[]>("/specialties");
