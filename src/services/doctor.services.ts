"use server";

import { httpClient } from "@/lib/axios/httpClient";
import {
  ICreateDoctorPayload,
  IDoctors,
  IDoctorDetails,
  IUpdateDoctorPayload,
} from "@/types/doctor.types";
import { ISpecialty } from "@/types/specialty.types";

export const getDoctors = async (queryString: string) => {
  const doctors = await httpClient.get<IDoctors[]>(
    queryString ? `/doctors?${queryString}` : "/doctors",
  );
  return doctors;
};

// Admin only: full doctor data (server checks ADMIN / SUPER_ADMIN)
export const getDoctorsForAdmin = async (queryString: string) => {
  const doctors = await httpClient.get<IDoctors[]>(
    queryString ? `/doctors/admin?${queryString}` : "/doctors/admin",
  );
  return doctors;
};

export const getDoctorByIdForAdmin = async (id: string) => {
  const doctor = await httpClient.get<IDoctorDetails>(
    `/doctors/admin/${encodeURIComponent(id)}`,
  );
  return doctor;
};

export const getAllSpecialties = async () => {
  const specialties = await httpClient.get<ISpecialty[]>("/specialties");
  return specialties;
};

export const createDoctor = async (payload: ICreateDoctorPayload) => {
  const response = await httpClient.post<IDoctors>(
    "/users/create-doctor",
    payload,
  );
  return response;
};

export const updateDoctor = async (
  id: string,
  payload: IUpdateDoctorPayload,
) => {
  const response = await httpClient.patch<IDoctors>(
    `/doctors/${id}`,
    payload,
  );
  return response;
};

export const deleteDoctor = async (id: string) => {
  const response = await httpClient.delete<{ message: string }>(
    `/doctors/${id}`,
  );
  return response;
};

export const getDoctorById = async (id: string) => {
  const doctor = await httpClient.get<IDoctorDetails>(`/doctors/${id}`);
  return doctor;
};
