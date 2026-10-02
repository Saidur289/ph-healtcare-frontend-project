"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { getUserInfo } from "@/services/auth.service";
import { passwordSchema } from "@/zod/auth.validation";
import { z } from "zod";

export type TAdminResult = { success: boolean; message: string; fieldErrors?: Record<string, string> };

const apiMessage = (error: unknown, fallback: string) => {
  const message = (error as { response?: { data?: { message?: unknown } } })?.response?.data?.message;
  return typeof message === "string" ? message : fallback;
};

const firstErrors = (error: z.ZodError) => {
  const out: Record<string, string> = {};
  error.issues.forEach((issue) => {
    out[String(issue.path.at(-1) ?? "form")] ??= issue.message;
  });
  return out;
};

const id = z.uuid("Invalid id");
const reason = z.string().trim().max(300, "Reason must be at most 300 characters").optional();

// the API checks roles too; this keeps other roles from even reaching it
const requireAdmin = async (superOnly = false) => {
  const role = (await getUserInfo())?.role;
  return superOnly ? role === "SUPER_ADMIN" : role === "ADMIN" || role === "SUPER_ADMIN";
};
const denied = (superOnly = false): TAdminResult => ({
  success: false,
  message: superOnly ? "Only a super admin can do this" : "Only admins can do this",
});

const run = async (fn: () => Promise<unknown>, ok: string, fail: string): Promise<TAdminResult> => {
  try {
    await fn();
    return { success: true, message: ok };
  } catch (error) {
    return { success: false, message: apiMessage(error, fail) };
  }
};

// ---------- users (patients, doctors, admins) ----------
export const changeUserStatusAction = async (userId: string, status: "ACTIVE" | "BLOCKED"): Promise<TAdminResult> => {
  if (!(await requireAdmin())) return denied();
  if (!z.string().min(1).max(100).safeParse(userId).success || !["ACTIVE", "BLOCKED"].includes(status)) {
    return { success: false, message: "Invalid request" };
  }
  return run(
    () => httpClient.patch("/admins/change-user-status", { userId, userStatus: status }),
    status === "BLOCKED" ? "User blocked and signed out" : "User unblocked",
    "Could not change the status",
  );
};

const adminSchema = z.object({
  name: z.string().trim().min(5, "Name must be at least 5 characters").max(30, "Name must be at most 30 characters"),
  email: z.email("Enter a valid email").trim().max(254),
  contactNumber: z
    .string()
    .trim()
    .transform((v) => (v === "" ? undefined : v))
    .pipe(z.string().min(11, "At least 11 characters").max(14, "At most 14 characters").optional()),
  // same rules as the API (shared with the register form)
  password: passwordSchema,
});

export const createAdminAction = async (values: z.input<typeof adminSchema>): Promise<TAdminResult> => {
  if (!(await requireAdmin(true))) return denied(true);
  const parsed = adminSchema.safeParse(values);
  if (!parsed.success) return { success: false, message: "Please fix the highlighted fields", fieldErrors: firstErrors(parsed.error) };
  const { password, ...admin } = parsed.data;
  return run(
    () => httpClient.post("/users/create-admin", { password, admin: Object.fromEntries(Object.entries(admin).filter(([, v]) => v !== undefined)) }),
    "Admin created. They must change the password on first login.",
    "Could not create the admin",
  );
};

const updateAdminSchema = z.object({
  name: z.string().trim().min(2).max(60),
  contactNumber: z
    .string()
    .trim()
    .transform((v) => (v === "" ? undefined : v))
    .pipe(z.string().min(11, "At least 11 characters").max(14, "At most 14 characters").optional()),
});
export const updateAdminAction = async (adminId: string, values: z.input<typeof updateAdminSchema>): Promise<TAdminResult> => {
  if (!(await requireAdmin(true))) return denied(true);
  const parsed = updateAdminSchema.safeParse(values);
  if (!id.safeParse(adminId).success) return { success: false, message: "Invalid admin" };
  if (!parsed.success) return { success: false, message: "Please fix the highlighted fields", fieldErrors: firstErrors(parsed.error) };
  const data = Object.fromEntries(Object.entries(parsed.data).filter(([, v]) => v !== undefined));
  return run(() => httpClient.patch(`/admins/${adminId}`, data), "Admin updated", "Could not update the admin");
};

export const deleteAdminAction = async (adminId: string): Promise<TAdminResult> => {
  if (!(await requireAdmin(true))) return denied(true);
  if (!id.safeParse(adminId).success) return { success: false, message: "Invalid admin" };
  return run(() => httpClient.delete(`/admins/${adminId}`), "Admin removed", "Could not remove the admin");
};

export const changeUserRoleAction = async (userId: string, role: "ADMIN" | "SUPER_ADMIN"): Promise<TAdminResult> => {
  if (!(await requireAdmin(true))) return denied(true);
  if (!z.string().min(1).max(100).safeParse(userId).success || !["ADMIN", "SUPER_ADMIN"].includes(role)) {
    return { success: false, message: "Invalid request" };
  }
  return run(() => httpClient.patch("/admins/change-user-role", { userId, role }), "Role changed", "Could not change the role");
};

// ---------- appointments / reviews ----------
export const adminCancelAppointmentAction = async (appointmentId: string, why?: string): Promise<TAdminResult> => {
  if (!(await requireAdmin())) return denied();
  if (!id.safeParse(appointmentId).success) return { success: false, message: "Invalid appointment" };
  const parsed = reason.safeParse(why || undefined);
  if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid reason" };
  return run(
    () =>
      httpClient.patch(`/appointments/change-appointment-status/${appointmentId}`, {
        status: "CANCELED",
        ...(parsed.data ? { reason: parsed.data } : {}),
      }),
    "Appointment cancelled (paid bookings are refunded)",
    "Could not cancel the appointment",
  );
};

export const setReviewVisibilityAction = async (reviewId: string, isHidden: boolean, why?: string): Promise<TAdminResult> => {
  if (!(await requireAdmin())) return denied();
  if (!id.safeParse(reviewId).success) return { success: false, message: "Invalid review" };
  const parsed = z.string().trim().min(3, "Give a short reason (3+ characters)").max(300).optional().safeParse(why || undefined);
  if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid reason" };
  return run(
    () => httpClient.patch(`/reviews/${reviewId}/visibility`, { isHidden, ...(isHidden && parsed.data ? { reason: parsed.data } : {}) }),
    isHidden ? "Review hidden from the public profile" : "Review is visible again",
    "Could not change the review",
  );
};

// ---------- specialties ----------
const MAX_ICON_BYTES = 5 * 1024 * 1024;
const specialtySchema = z.object({
  title: z.string().trim().min(2, "Title must be at least 2 characters").max(60, "Title must be at most 60 characters"),
  description: z.string().trim().max(300, "Description must be at most 300 characters"),
});

const specialtyForm = (formData: FormData, requireTitle: boolean) => {
  const parsed = (requireTitle ? specialtySchema : specialtySchema.partial()).safeParse({
    title: formData.get("title") ?? undefined,
    description: formData.get("description") ?? undefined,
  });
  if (!parsed.success) return { error: { success: false, message: "Please fix the highlighted fields", fieldErrors: firstErrors(parsed.error) } as TAdminResult };
  const icon = formData.get("icon");
  if (icon instanceof File && icon.size > 0) {
    if (!["image/jpeg", "image/png", "image/webp"].includes(icon.type)) return { error: { success: false, message: "The icon must be a JPG, PNG or WEBP image" } as TAdminResult };
    if (icon.size > MAX_ICON_BYTES) return { error: { success: false, message: "The icon must be 5 MB or smaller" } as TAdminResult };
  }
  const data = Object.fromEntries(Object.entries(parsed.data).filter(([, v]) => v !== undefined && v !== ""));
  const outgoing = new FormData();
  outgoing.set("data", JSON.stringify(data));
  if (icon instanceof File && icon.size > 0) outgoing.set("file", icon, icon.name.slice(0, 100));
  return { outgoing };
};
const multipart = { headers: { "Content-Type": "multipart/form-data" } };

export const createSpecialtyAction = async (formData: FormData): Promise<TAdminResult> => {
  if (!(await requireAdmin())) return denied();
  const form = specialtyForm(formData, true);
  if (form.error) return form.error;
  return run(() => httpClient.post("/specialties", form.outgoing, multipart), "Specialty created", "Could not create the specialty");
};

export const updateSpecialtyAction = async (specialtyId: string, formData: FormData): Promise<TAdminResult> => {
  if (!(await requireAdmin())) return denied();
  if (!id.safeParse(specialtyId).success) return { success: false, message: "Invalid specialty" };
  const form = specialtyForm(formData, false);
  if (form.error) return form.error;
  return run(() => httpClient.patch(`/specialties/${specialtyId}`, form.outgoing, multipart), "Specialty updated", "Could not update the specialty");
};

export const deleteSpecialtyAction = async (specialtyId: string): Promise<TAdminResult> => {
  if (!(await requireAdmin())) return denied();
  if (!id.safeParse(specialtyId).success) return { success: false, message: "Invalid specialty" };
  return run(() => httpClient.delete(`/specialties/${specialtyId}`), "Specialty removed", "Could not remove the specialty");
};

// ---------- doctor specialties ----------
export const setDoctorSpecialtiesAction = async (
  doctorId: string,
  changes: { specialtyId: string; shouldDelete: boolean }[],
): Promise<TAdminResult> => {
  if (!(await requireAdmin())) return denied();
  const parsed = z
    .array(z.object({ specialtyId: id, shouldDelete: z.boolean() }))
    .min(1, "Nothing changed")
    .max(50)
    .safeParse(changes);
  if (!id.safeParse(doctorId).success || !parsed.success) return { success: false, message: parsed.success ? "Invalid doctor" : parsed.error.issues[0]?.message ?? "Invalid change" };
  return run(() => httpClient.patch(`/doctors/${doctorId}`, { specialties: parsed.data }), "Specialties updated", "Could not update the specialties");
};
