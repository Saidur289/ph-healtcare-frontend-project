"use server";

import { httpClient } from "@/lib/axios/httpClient";
import {
  ICreateDoctorSchedulePayload,
  IDoctorSchedule,
  IUpdateDoctorSchedulePayload,
} from "@/types/doctorSchedule.types";

export const getMyDoctorSchedules = async (queryString: string) => {
  return await httpClient.get<IDoctorSchedule[]>(
    queryString
      ? `/doctor-schedules/my-doctor-schedules?${queryString}`
      : "/doctor-schedules/my-doctor-schedules",
  );
};
export const createDoctorSchedule = async (
  payload: ICreateDoctorSchedulePayload,
) => {
  return await httpClient.post<IDoctorSchedule[]>(
    "/doctor-schedules/create-my-doctor-schedule",
    payload,
  );
};
export const updateDoctorSchedule = async (
  payload: IUpdateDoctorSchedulePayload,
) => {
  return await httpClient.patch<{ count: number }>(
    "/doctor-schedules/update-doctor-schedule",
    payload,
  );
};
export const deleteDoctorSchedule = async (id: string) => {
  return await httpClient.delete<null>(
    `/doctor-schedules/delete-my-schedule/${encodeURIComponent(id)}`,
  );
};
