import {
  ICreateDoctorSchedulePayload,
  IUpdateDoctorSchedulePayload,
} from "@/types/doctorSchedules.types";
import z from "zod";

export const createDoctorsScheduleServerZodSchema = z.object({
  scheduleIds: z.array(
    z
      .uuid("Each id must be a valid uuid")
      .min(1, "At least one schedule is required"),
  ),
}) satisfies z.ZodType<ICreateDoctorSchedulePayload>;

export const updateDoctorScheduleServerZodSchema = z.object({
  scheduleIds: z
    .array(
      z.object({
        shouldDelete: z.boolean(),
        id: z.uuid("Schedule id must be a valid UUID"),
      }),
    )
    .min(1, "Provide at least one schedule change"),
}) satisfies z.ZodType<IUpdateDoctorSchedulePayload>;
