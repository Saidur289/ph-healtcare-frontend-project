import { IAppointment } from "@/types/appointment.types";
import { format } from "date-fns";

export const OPENS_BEFORE_MS = 10 * 60 * 1000; // same rule as the API (join opens 10 min early)

const time = (value?: string | Date) => (value ? new Date(value).getTime() : 0);

export const slotStart = (a: IAppointment) => time(a.schedule?.startDateTime);
export const slotEnd = (a: IAppointment) => time(a.schedule?.endDateTime);

export const isActiveAppointment = (a: IAppointment) => a.status === "SCHEDULED" || a.status === "INPROGRESS";

export const isJoinable = (a: IAppointment, now: number) =>
  a.paymentStatus === "PAID" &&
  isActiveAppointment(a) &&
  now >= slotStart(a) - OPENS_BEFORE_MS &&
  now <= slotEnd(a);

// active appointments that have not ended yet, soonest first
export const upcomingAppointments = (list: IAppointment[], now: number) =>
  list.filter((a) => isActiveAppointment(a) && slotEnd(a) >= now).sort((x, y) => slotStart(x) - slotStart(y));

export const formatDay = (value?: string | Date) => (value ? format(new Date(value), "dd MMM yyyy") : "—");
export const formatTime = (value?: string | Date) => (value ? format(new Date(value), "hh:mm a") : "—");

// "BDT" instead of ৳: Inter has no taka glyph, so the sign rendered in a fallback font
export const formatTaka = (amount?: number | null) => `BDT ${Math.round(amount ?? 0).toLocaleString("en-US")}`;
