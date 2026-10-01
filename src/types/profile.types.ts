import { UserRole } from "@/lib/authUtils";

export const BLOOD_GROUPS = [
  "A_POSITIVE",
  "A_NEGATIVE",
  "B_POSITIVE",
  "B_NEGATIVE",
  "AB_POSITIVE",
  "AB_NEGATIVE",
  "O_POSITIVE",
  "O_NEGATIVE",
] as const;
export type TBloodGroup = (typeof BLOOD_GROUPS)[number];

export const bloodGroupLabel = (value: string) =>
  value.replace("_POSITIVE", "+").replace("_NEGATIVE", "−");

export interface IHealthData {
  id: string;
  gender: "MALE" | "FEMALE";
  dateOfBirth: string;
  bloodGroup: TBloodGroup;
  height: string;
  weight: string;
  hasAllergies: boolean;
  hasDiabetes: boolean;
  smokingStatus: boolean;
  pregnancyStatus: boolean;
  hasPastSurgeries: boolean;
  recentAnxiety: boolean;
  recentDepression: boolean;
  dietaryPreferences?: string | null;
  mentalHealthHistory?: string | null;
  immunizationStatus?: string | null;
  maritalStatus?: string | null;
  updatedAt?: string;
}

export interface IMedicalReport {
  id: string;
  reportName: string;
  reportLink: string;
  createdAt: string;
}

// GET /profile/me (fields depend on the role)
export interface IMyProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  image?: string | null;
  createdAt: string;
  profile: {
    id: string;
    name: string;
    email: string;
    profilePhoto?: string | null;
    contactNumber?: string | null;
    address?: string | null;
    // doctor
    registrationNumber?: string;
    experience?: number;
    gender?: "MALE" | "FEMALE";
    appointmentFee?: number;
    qualification?: string;
    currentWorkingPlace?: string | null;
    designation?: string;
    averageRating?: number;
    reviewCount?: number;
    specialties?: { specialty: { id: string; title: string } }[];
    // patient
    patientHealthData?: IHealthData | null;
    medicalReports?: IMedicalReport[];
  } | null;
}
