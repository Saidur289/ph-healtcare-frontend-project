export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER",
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  BLOCKED = "BLOCKED",
  DELETED = "DELETED",
}

/* =========================
   DOCTOR USER DETAILS
========================= */

export interface IDoctorUserDetails {
  id?: string;
  email?: string;
  name?: string;
  role?: string;

  // fixed here
  status: UserStatus;

  emailVerified?: boolean;
  image?: string;
  isDeleted?: boolean;
  deletedAt?: string | Date | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

/* =========================
   DOCTOR REVIEW
========================= */

export interface IDoctorReview {
  id?: string;
  rating?: number;
  comment?: string;
  patientId?: string;
  createdAt?: string | Date;
}

/* =========================
   DOCTOR SCHEDULE
========================= */

export interface IDoctorScheduleItem {
  id?: string;
  isBooked?: boolean;

  schedule?: {
    id?: string;
    startDateTime?: string | Date;
    endDateTime?: string | Date;
  };
}

/* =========================
   DOCTOR APPOINTMENT
========================= */

export interface IDoctorAppointmentItem {
  id?: string;
  status?: string;
  createdAt?: string | Date;

  patient?: {
    id?: string;
    name?: string;
    email?: string;
  };

  schedule?: {
    id?: string;
    startDateTime?: string | Date;
    endDateTime?: string | Date;
  };

  prescription?: {
    id?: string;
  } | null;
}

/* =========================
   DOCTOR
========================= */

export interface IDoctors {
  id: number;
  name: string;
  email: string;

  profilePhoto?: string;
  contactNumber?: string;
  address?: string;

  registrationNumber: string;
  experience?: number;

  gender: Gender;

  appointmentFee: number;

  qualification: string;
  currentWorkingPlace: string;
  designation: string;

  averageRating: number;

  createdAt: Date;

  user: {
    status: UserStatus;
  };

  specialties: Array<{
    specialtyId: string;
    doctorId: string;

    specialty: {
      id: string;
      title: string;
      icon: string;
    };
  }>;
}

/* =========================
   CREATE DOCTOR PAYLOAD
========================= */

export interface ICreateDoctorPayload {
  password: string;

  doctor: {
    name: string;
    email: string;
    contactNumber: string;
    address?: string;
    registrationNumber: string;
    experience?: number;
    gender: Gender.MALE | Gender.FEMALE;
    appointmentFee: number;
    qualification: string;
    currentWorkingPlace: string;
    designation: string;
  };

  specialties: string[];
}

/* =========================
   UPDATE SPECIALTY CHANGE
========================= */

export interface IUpdateDoctorSpecialtyChange {
  specialtyId: string;
  shouldDelete?: boolean;
}

/* =========================
   UPDATE DOCTOR PAYLOAD
========================= */

export interface IUpdateDoctorPayload {
  doctor?: {
    name?: string;
    contactNumber?: string;
    address?: string;
    registrationNumber?: string;
    experience?: number;
    gender?: Gender.MALE | Gender.FEMALE;
    appointmentFee?: number;
    qualification?: string;
    currentWorkingPlace?: string;
    designation?: string;
  };

  specialties?: IUpdateDoctorSpecialtyChange[];
}

/* =========================
   DOCTOR DETAILS
========================= */

export interface IDoctorDetails extends IDoctors {
  user: IDoctorUserDetails;

  appointments?: IDoctorAppointmentItem[];

  doctorSchedules?: IDoctorScheduleItem[];

  reviews?: IDoctorReview[];
}
