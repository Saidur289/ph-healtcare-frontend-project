"use server";

import { httpClient } from "@/lib/axios/httpClient";
import {
  type ICreateSchedulePayload,
  type ISchedule,
  type IUpdateSchedulePayload,
} from "@/types/schedule.types";

export const getSchedules = async (queryString: string) => {
  return await httpClient.get<ISchedule[]>(
    queryString ? `/schedules?${queryString}` : "/schedules",
  );
};

export const createSchedule = async (payload: ICreateSchedulePayload) => {
  return await httpClient.post<ISchedule[]>("/schedules", payload);
};

export const updateSchedule = async (
  id: string,
  payload: IUpdateSchedulePayload,
) => {
  return await httpClient.patch<ISchedule>(`/schedules/${id}`, payload);
};

export const deleteSchedule = async (id: string) => {
  return await httpClient.delete<boolean>(`/schedules/${id}`);
};

export const getScheduleById = async (id: string) => {
  return await httpClient.get<ISchedule>(`/schedules/${id}`);
};
