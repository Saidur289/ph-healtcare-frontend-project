export interface IJoinCallResult {
  roomUrl: string;
  token: string;
  role: "DOCTOR" | "PATIENT";
  expiresAt: string;
  slotStart: string;
  slotEnd: string;
}

export interface IMedicine {
  name: string;
  dose: string;
  frequency: string;
  duration: string;
  notes?: string;
}

export interface IPrescription {
  id: string;
  appointmentId: string;
  followUpDate: string;
  instructions: string;
  medicines: IMedicine[];
  // true when the PDF exists (opened via /files/prescriptions/:id)
  pdfUrl?: boolean | null;
  createdAt: string;
  patient?: { id: string; name: string; email: string };
  doctor?: { id: string; name: string; email: string; designation?: string };
  appointment?: { id: string; status: string; schedule?: { startDateTime: string; endDateTime: string } };
}

export interface IReview {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  appointmentId: string;
  patient?: { name?: string; profilePhoto?: string | null };
  doctor?: { name?: string };
}
