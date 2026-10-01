import "server-only";

// Called only from server pages and app/_actions/profile.actions.ts (which validate
// input first). "server-only" keeps this out of client bundles; unlike "use server"
// it does not expose these functions as callable endpoints.
import { httpClient } from "@/lib/axios/httpClient";
import { IMyProfile } from "@/types/profile.types";

const multipart = { headers: { "Content-Type": "multipart/form-data" } };

export const getMyProfile = async () => httpClient.get<IMyProfile>("/profile/me");

// FormData: "data" (JSON string) + optional "profilePhoto" file
export const patchMyProfile = async (form: FormData) => httpClient.patch<IMyProfile>("/profile/me", form, multipart);

// FormData: "data" (JSON with patientHealthData / patientMedicalReport) + optional "medicalReports" file
export const patchPatientRecords = async (form: FormData) =>
  httpClient.patch<unknown>("/patients/update-profile", form, multipart);
