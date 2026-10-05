// same values as the API (server/prisma/schema/enums.prisma)
export type AppointmentStatus =
  | "SCHEDULED"
  | "INPROGRESS"
  | "COMPLETED"
  | "CANCELED"
  | "NO_SHOW";
export type PaymentStatus = "PAID" | "UNPAID" | "EXPIRED" | "REFUNDED";
export interface IAppointmentDoctor {
  id?: string;
  email?: string;
  name?: string;
  profilePhoto?: string;
  designation?: string;
  currentWorkingPlace?: string;
  appointmentFee?: number;
}
export interface IAppointmentPatient {
  id?: string;
  email?: string;
  name?: string;
}
export interface IAppointmentSchedule {
  id?: string;
  startDateTime?: string | Date;
  endDateTime?: string | Date;
}
export interface IAppointmentPayment {
  id?: string;
  amount?: number;
  transactionId?: string;
  status?: PaymentStatus;
  // true when an invoice exists (opened via /files/invoices/:paymentId)
  invoiceUrl?: boolean;
}
export interface IAppointment {
  id: string;
  doctorId?: string;
  patientId?: string;
  scheduleId?: string;
  videoCallingId?: string;
  status?: AppointmentStatus;
  paymentStatus?: PaymentStatus;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  doctor?: IAppointmentDoctor;
  patient?: IAppointmentPatient;
  schedule?: IAppointmentSchedule;
  payment?: IAppointmentPayment;
  // present when one exists (lists only)
  review?: { id: string; rating: number } | null;
  prescription?: { id: string; pdfUrl?: boolean | null } | null;
}
export interface IBookAppointmentPayload {
  doctorId: string;
  scheduleId: string;
}
export interface IBookAppointmentResult {
  appointment: IAppointment;
  payment?: IAppointmentPayment;
  paymentUrl?: string | null;
}
export interface IInitiatePaymentResult {
  paymentUrl: string;
}

// GET /appointments/:id/medical-history (DOCTOR, own appointment; every read is audited)
export interface IMedicalHistory {
  patient: { id: string; name: string; profilePhoto?: string | null };
  healthData: {
    gender: "MALE" | "FEMALE";
    dateOfBirth: string;
    bloodGroup: string;
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
    updatedAt?: string;
  } | null;
  // a report file opens through /files/reports/:id (signed, expiring link)
  reports: { id: string; reportName: string; createdAt: string; hasFile: boolean }[];
}
