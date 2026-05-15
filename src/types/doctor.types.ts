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

export interface IDoctors {
  id: string;
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
  averageRating: number;
  createdAt: Date;
  currentWorkingPlace: string;
  designation: string;
  user: {
    status: UserStatus;
  };
  specialties: Array<{
    specialtyId: string;
    doctorId: string;
    specialty: {
      id: string;
      title: string;
      icon?: string;
    };
  }>;
}
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
export interface IUpdateDoctorSpecialtyChange {
  specialtyId: string;
  shouldDelete?: boolean;
}
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
export interface IDoctorUserDetails {
  id?: string;
  email?: string;
  name?: string;
  role?: string;
  image?: string;
  status: UserStatus;
  isDeleted?: boolean;
  emailVerified?: boolean;
  deletedAt?: Date | string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}
export interface IDoctorReview {
  id?: string;
  rating?: number;
  comment?: string;
  patientId?: string;
  createdAt?: string | Date;
}
export interface IDoctorScheduleItem {
  id?: string;
  isBooked?: boolean;
  schedule?: {
    id?: string;
    startDateTime?: string | Date;
    endDateTime?: string | Date;
  };
}
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
export interface IDoctorDetails extends IDoctors {
  user: IDoctorUserDetails;
  reviews?: IDoctorReview[];
  schedules?: IDoctorScheduleItem[];
  appointments?: IDoctorAppointmentItem[];
}
