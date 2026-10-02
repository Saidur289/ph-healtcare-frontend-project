"use server";

import {
  changeAppointmentStatus,
  createPrescription,
  createReview,
} from "@/services/consultation.services";
import { getUserInfo } from "@/services/auth.service";
import { z } from "zod";

type TResult = { success: true; message: string } | { success: false; message: string };

const apiMessage = (error: unknown, fallback: string) => {
  const message = (error as { response?: { data?: { message?: unknown } } })?.response?.data?.message;
  return typeof message === "string" ? message : fallback;
};

const idSchema = z.uuid("Invalid appointment");

// same rules as the API (server/src/app/module/prescription/prescription.validation.ts)
const text = (label: string, max: number) =>
  z.string().trim().min(1, `${label} is required`).max(max, `${label} is too long`);
const medicineFormSchema = z.object({
  name: text("Medicine name", 120),
  dose: text("Dose", 60),
  frequency: text("Frequency", 60),
  duration: text("Duration", 60),
  notes: z.string().trim().max(300).optional(),
});
const prescriptionSchema = z.object({
  appointmentId: idSchema,
  followUpDate: z.string().refine((v) => !Number.isNaN(Date.parse(v)), "Pick a follow-up date"),
  instructions: text("Instructions", 5000),
  medicines: z.array(medicineFormSchema).min(1, "Add at least one medicine").max(30),
});

const reviewSchema = z.object({
  appointmentId: idSchema,
  rating: z.int().min(1, "Choose 1 to 5 stars").max(5),
  comment: z.string().trim().min(5, "Write at least 5 characters").max(1000),
});

export const completeAppointmentAction = async (appointmentId: string): Promise<TResult> => {
  if (!idSchema.safeParse(appointmentId).success) return { success: false, message: "Invalid appointment" };
  try {
    await changeAppointmentStatus(appointmentId, "COMPLETED");
    return { success: true, message: "Consultation completed" };
  } catch (error) {
    return { success: false, message: apiMessage(error, "Could not complete the consultation") };
  }
};

export const createPrescriptionAction = async (
  payload: z.infer<typeof prescriptionSchema>,
): Promise<TResult> => {
  const parsed = prescriptionSchema.safeParse(payload);
  if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid prescription" };
  try {
    const medicines = parsed.data.medicines.map(({ notes, ...rest }) => (notes ? { ...rest, notes } : rest));
    await createPrescription({ ...parsed.data, medicines });
    return { success: true, message: "Prescription saved. The patient will receive the PDF by email." };
  } catch (error) {
    return { success: false, message: apiMessage(error, "Could not save the prescription") };
  }
};

export const createReviewAction = async (payload: z.infer<typeof reviewSchema>): Promise<TResult> => {
  const parsed = reviewSchema.safeParse(payload);
  if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid review" };
  try {
    await createReview(parsed.data);
    return { success: true, message: "Thank you for your review!" };
  } catch (error) {
    return { success: false, message: apiMessage(error, "Could not save the review") };
  }
};

const reasonSchema = z.string().trim().max(300, "Reason must be at most 300 characters").optional();

// doctor cancels any time before the visit (the API refunds a paid booking)
export const doctorCancelAppointmentAction = async (appointmentId: string, reason?: string): Promise<TResult> => {
  if ((await getUserInfo())?.role !== "DOCTOR") return { success: false, message: "Only doctors can do this" };
  if (!idSchema.safeParse(appointmentId).success) return { success: false, message: "Invalid appointment" };
  const parsedReason = reasonSchema.safeParse(reason || undefined);
  if (!parsedReason.success) return { success: false, message: parsedReason.error.issues[0]?.message ?? "Invalid reason" };
  try {
    await changeAppointmentStatus(appointmentId, "CANCELED", parsedReason.data);
    return { success: true, message: "Appointment cancelled" };
  } catch (error) {
    return { success: false, message: apiMessage(error, "Could not cancel the appointment") };
  }
};

// allowed by the API from 15 minutes after the start
export const markNoShowAction = async (appointmentId: string): Promise<TResult> => {
  if ((await getUserInfo())?.role !== "DOCTOR") return { success: false, message: "Only doctors can do this" };
  if (!idSchema.safeParse(appointmentId).success) return { success: false, message: "Invalid appointment" };
  try {
    await changeAppointmentStatus(appointmentId, "NO_SHOW");
    return { success: true, message: "Marked as no-show" };
  } catch (error) {
    return { success: false, message: apiMessage(error, "Could not update the appointment") };
  }
};
