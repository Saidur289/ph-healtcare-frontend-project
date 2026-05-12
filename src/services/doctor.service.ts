"use server";
import { httpClient } from "@/lib/axios/httpClient";
import { IDoctors } from "@/types/doctor.types";

export const getDoctors = async () => {
  const doctors = await httpClient.get<IDoctors[]>("/doctors");

  return doctors;
};
