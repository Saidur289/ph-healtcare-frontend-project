import { AppointmentStatus, PaymentStatus } from "./appointment.types";

type TPerson = { id: string; name: string; email?: string; profilePhoto?: string | null };

export interface IAdminPatient {
  id: string;
  name: string;
  email: string;
  profilePhoto?: string | null;
  contactNumber?: string | null;
  address?: string | null;
  createdAt: string;
  user: { id: string; status: "ACTIVE" | "BLOCKED" | "DELETED"; emailVerified: boolean; createdAt: string };
  _count: { appointments: number; reviews: number };
}

export interface IAdminAppointment {
  id: string;
  status: AppointmentStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  patient: TPerson;
  doctor: TPerson & { appointmentFee?: number };
  schedule: { id: string; startDateTime: string; endDateTime: string };
  payment?: {
    id: string;
    amount: number;
    status: PaymentStatus;
    invoiceUrl?: string | null;
    invoiceNumber?: string | null;
    paidAt?: string | null;
    refundedAt?: string | null;
  } | null;
}

export interface IAdminPayment {
  id: string;
  amount: number;
  status: PaymentStatus;
  invoiceNumber?: string | null;
  invoiceUrl?: string | null;
  paidAt?: string | null;
  refundedAt?: string | null;
  createdAt: string;
  appointment: {
    id: string;
    status: AppointmentStatus;
    patient: TPerson;
    doctor: TPerson;
    schedule: { startDateTime: string; endDateTime: string };
  };
}

export interface IAdminReview {
  id: string;
  rating: number;
  comment?: string | null;
  isHidden: boolean;
  hiddenReason?: string | null;
  hiddenAt?: string | null;
  createdAt: string;
  patient: TPerson;
  doctor: TPerson;
}

// metadata only (the API leaves out medicines, instructions and the PDF link)
export interface IAdminPrescription {
  id: string;
  createdAt: string;
  followUpDate: string;
  emailSentAt?: string | null;
  patient: TPerson;
  doctor: TPerson & { designation?: string };
  appointment: { id: string; status: AppointmentStatus };
}

export interface IAdminUser {
  id: string;
  name: string;
  email: string;
  profilePhoto?: string | null;
  contactNumber?: string | null;
  createdAt: string;
  user: { id: string; role: "ADMIN" | "SUPER_ADMIN"; status: "ACTIVE" | "BLOCKED" | "DELETED" };
}

export interface IAdminDoctorSchedule {
  doctorId: string;
  scheduleId: string;
  isBooked: boolean;
  createdAt: string;
  schedule: { id: string; startDateTime: string; endDateTime: string };
  doctor: TPerson;
}

export interface IAdminSpecialty {
  id: string;
  title: string;
  description?: string | null;
  icon?: string | null;
  createdAt: string;
  _count?: { doctorSpecialty: number };
}
