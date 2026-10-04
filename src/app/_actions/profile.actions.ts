"use server";

import { getUserInfo } from "@/services/auth.service";
import { deleteMyAccount, patchMyProfile, patchPatientRecords } from "@/services/profile.services";
import { clearAuthCookies } from "@/lib/cookieUtils";
import { BLOOD_GROUPS } from "@/types/profile.types";
import { revalidatePath } from "next/cache";
import { z } from "zod";

type TResult = { success: boolean; message: string; fieldErrors?: Record<string, string> };

const MAX_FILE_BYTES = 5 * 1024 * 1024; // same as the API
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const REPORT_TYPES = [...IMAGE_TYPES, "application/pdf"];

const apiMessage = (error: unknown, fallback: string) => {
  const message = (error as { response?: { data?: { message?: unknown } } })?.response?.data?.message;
  return typeof message === "string" ? message : fallback;
};

// first message per field
const fieldErrors = (error: z.ZodError) => {
  const out: Record<string, string> = {};
  error.issues.forEach((issue) => {
    const key = String(issue.path[0] ?? "form");
    out[key] ??= issue.message;
  });
  return out;
};

const optionalText = (label: string, min: number, max: number) =>
  z
    .string()
    .trim()
    .transform((v) => (v === "" ? undefined : v))
    .pipe(z.string().min(min, `${label} must be at least ${min} characters`).max(max, `${label} must be at most ${max} characters`).optional());

// same rules as server/src/app/module/profile/profile.validation.ts
const profileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(60, "Name must be at most 60 characters"),
  contactNumber: z
    .string()
    .trim()
    .transform((v) => (v === "" ? undefined : v))
    .pipe(z.string().regex(/^\+?[0-9]{7,15}$/, "Use 7 to 15 digits, optionally starting with +").optional()),
  address: optionalText("Address", 3, 200),
  designation: optionalText("Designation", 2, 50),
  qualification: optionalText("Qualification", 2, 50),
  currentWorkingPlace: optionalText("Working place", 2, 50),
  experience: z
    .string()
    .trim()
    .transform((v) => (v === "" ? undefined : Number(v)))
    .pipe(z.int("Experience must be a whole number").min(0).max(70).optional()),
});

const ROLE_FIELDS: Record<string, (keyof z.infer<typeof profileSchema>)[]> = {
  PATIENT: ["name", "contactNumber", "address"],
  DOCTOR: ["name", "contactNumber", "address", "designation", "qualification", "currentWorkingPlace", "experience"],
  ADMIN: ["name", "contactNumber"],
  SUPER_ADMIN: ["name", "contactNumber"],
};

const checkFile = (file: FormDataEntryValue | null, types: string[], label: string) => {
  if (!(file instanceof File) || file.size === 0) return { file: null as File | null };
  if (!types.includes(file.type)) return { error: `${label}: only ${types.includes("application/pdf") ? "JPG, PNG, WEBP or PDF" : "JPG, PNG or WEBP"} files` };
  if (file.size > MAX_FILE_BYTES) return { error: `${label} must be 5 MB or smaller` };
  return { file };
};

export const updateProfileAction = async (formData: FormData): Promise<TResult> => {
  const user = await getUserInfo();
  if (!user) return { success: false, message: "Please log in again" };

  const allowed = ROLE_FIELDS[user.role] ?? ROLE_FIELDS.PATIENT;
  const raw = Object.fromEntries(allowed.map((key) => [key, String(formData.get(key) ?? "")]));
  const parsed = profileSchema.partial().required({ name: true }).safeParse(raw);
  if (!parsed.success) return { success: false, message: "Please fix the highlighted fields", fieldErrors: fieldErrors(parsed.error) };

  const photo = checkFile(formData.get("profilePhoto"), IMAGE_TYPES, "Photo");
  if ("error" in photo) return { success: false, message: photo.error!, fieldErrors: { profilePhoto: photo.error! } };

  // drop empty optional values so they are not sent as changes
  const data = Object.fromEntries(Object.entries(parsed.data).filter(([, v]) => v !== undefined));
  const outgoing = new FormData();
  outgoing.set("data", JSON.stringify(data));
  if (photo.file) outgoing.set("profilePhoto", photo.file, photo.file.name);

  try {
    await patchMyProfile(outgoing);
    revalidatePath("/", "layout"); // navbar name/photo
    return { success: true, message: "Profile saved" };
  } catch (error) {
    return { success: false, message: apiMessage(error, "Could not save your profile") };
  }
};

const yesNo = z.boolean();
// same rules as server/src/app/module/patient/patient.validation.ts
const healthSchema = z.object({
  gender: z.enum(["MALE", "FEMALE"], "Choose a gender"),
  dateOfBirth: z
    .string()
    .refine((v) => !Number.isNaN(Date.parse(v)), "Enter your date of birth")
    .refine((v) => Number.isNaN(Date.parse(v)) || Date.parse(v) <= Date.now(), "Date of birth can't be in the future"),
  bloodGroup: z.enum(BLOOD_GROUPS, "Choose a blood group"),
  height: z.string().trim().min(1, "Enter your height").max(20),
  weight: z.string().trim().min(1, "Enter your weight").max(20),
  hasAllergies: yesNo,
  hasDiabetes: yesNo,
  smokingStatus: yesNo,
  pregnancyStatus: yesNo,
  hasPastSurgeries: yesNo,
  recentAnxiety: yesNo,
  recentDepression: yesNo,
  dietaryPreferences: z.string().trim().max(500).optional(),
  mentalHealthHistory: z.string().trim().max(1000).optional(),
  immunizationStatus: z.string().trim().max(500).optional(),
  maritalStatus: z.string().trim().max(30).optional(),
});
export type THealthFormValues = z.input<typeof healthSchema>;

const requirePatient = async () => (await getUserInfo())?.role === "PATIENT";

export const saveHealthDataAction = async (values: THealthFormValues): Promise<TResult> => {
  if (!(await requirePatient())) return { success: false, message: "Only patients have health records" };
  const parsed = healthSchema.safeParse(values);
  if (!parsed.success) return { success: false, message: "Please fix the highlighted fields", fieldErrors: fieldErrors(parsed.error) };
  const patientHealthData = Object.fromEntries(Object.entries(parsed.data).filter(([, v]) => v !== "" && v !== undefined));
  const outgoing = new FormData();
  outgoing.set("data", JSON.stringify({ patientHealthData }));
  try {
    await patchPatientRecords(outgoing);
    revalidatePath("/dashboard/health-records");
    return { success: true, message: "Health information saved" };
  } catch (error) {
    return { success: false, message: apiMessage(error, "Could not save your health information") };
  }
};

export const uploadReportAction = async (formData: FormData): Promise<TResult> => {
  if (!(await requirePatient())) return { success: false, message: "Only patients can upload reports" };
  const report = checkFile(formData.get("report"), REPORT_TYPES, "Report");
  if ("error" in report) return { success: false, message: report.error! };
  if (!report.file) return { success: false, message: "Choose a file to upload" };
  const outgoing = new FormData();
  outgoing.set("data", JSON.stringify({}));
  outgoing.set("medicalReports", report.file, report.file.name.slice(0, 100));
  try {
    await patchPatientRecords(outgoing);
    revalidatePath("/dashboard/health-records");
    return { success: true, message: "Report uploaded" };
  } catch (error) {
    return { success: false, message: apiMessage(error, "Could not upload the report") };
  }
};

export const deleteReportAction = async (reportId: string): Promise<TResult> => {
  if (!(await requirePatient())) return { success: false, message: "Only patients can delete reports" };
  if (!z.uuid().safeParse(reportId).success) return { success: false, message: "Invalid report" };
  const outgoing = new FormData();
  outgoing.set("data", JSON.stringify({ patientMedicalReport: [{ reportId, shouldDelete: true }] }));
  try {
    await patchPatientRecords(outgoing);
    revalidatePath("/dashboard/health-records");
    return { success: true, message: "Report deleted" };
  } catch (error) {
    return { success: false, message: apiMessage(error, "Could not delete the report") };
  }
};

// Patient account deletion (the API anonymizes the data and ends every session)
export const deleteMyAccountAction = async (input: { password?: string; confirm?: string }): Promise<TResult> => {
  if (!(await requirePatient())) return { success: false, message: "Only patient accounts can be deleted here" };
  const parsed = z
    .object({ password: z.string().min(1).max(128).optional(), confirm: z.literal("DELETE").optional() })
    .refine((v) => v.password || v.confirm, "Enter your password")
    .safeParse({ password: input.password || undefined, confirm: input.confirm || undefined });
  if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? "Enter your password" };
  try {
    await deleteMyAccount(parsed.data);
  } catch (error) {
    return { success: false, message: apiMessage(error, "Your account could not be deleted") };
  }
  await clearAuthCookies();
  return { success: true, message: "Your account has been deleted" };
};
