"use server";

import { getMyAppointments } from "@/services/appointment.services";
import { getUserInfo } from "@/services/auth.service";
import { setMyAvailability } from "@/services/dashboard.service";
import { IDashboardNotice } from "@/types/dashboard.types";
import { z } from "zod";

const apiMessage = (error: unknown, fallback: string) => {
  const message = (error as { response?: { data?: { message?: unknown } } })?.response?.data?.message;
  return typeof message === "string" ? message : fallback;
};

export const setAvailabilityAction = async (
  isAvailable: boolean,
): Promise<{ success: boolean; message: string; isAvailable?: boolean }> => {
  if (!z.boolean().safeParse(isAvailable).success) return { success: false, message: "Invalid value" };
  const user = await getUserInfo();
  if (user?.role !== "DOCTOR") return { success: false, message: "Only doctors can change availability" };
  try {
    const res = await setMyAvailability(isAvailable);
    return { success: true, message: res.message, isAvailable: res.data.isAvailable };
  } catch (error) {
    return { success: false, message: apiMessage(error, "Could not update your availability") };
  }
};

const DAY_MS = 24 * 60 * 60 * 1000;

// Bell items built from the user's own appointments (there is no separate notification store yet):
// calls starting within 24 hours, and bookings still waiting for payment.
export const getNotificationsAction = async (): Promise<IDashboardNotice[]> => {
  const user = await getUserInfo();
  if (user?.role !== "DOCTOR" && user?.role !== "PATIENT") return [];
  try {
    const { data } = await getMyAppointments();
    const now = Date.now();
    const notices: IDashboardNotice[] = [];
    for (const a of data ?? []) {
      const start = a.schedule?.startDateTime ? new Date(a.schedule.startDateTime).getTime() : 0;
      const end = a.schedule?.endDateTime ? new Date(a.schedule.endDateTime).getTime() : start;
      const active = a.status === "SCHEDULED" || a.status === "INPROGRESS";
      if (!active || end < now) continue;
      const other = user.role === "DOCTOR" ? a.patient?.name ?? "a patient" : `Dr. ${a.doctor?.name ?? ""}`;
      if (a.paymentStatus === "PAID" && start - now <= DAY_MS) {
        notices.push({
          id: `call-${a.id}`,
          kind: "call",
          title: start <= now ? "Consultation in progress" : "Upcoming consultation",
          message: `Video consultation with ${other}`,
          at: new Date(start).toISOString(),
          href: `/consultation/room/${a.id}`,
        });
      } else if (user.role === "PATIENT" && a.paymentStatus === "UNPAID") {
        notices.push({
          id: `pay-${a.id}`,
          kind: "payment",
          title: "Payment pending",
          message: `Pay for your appointment with ${other} to confirm it`,
          at: new Date(start).toISOString(),
          href: "/dashboard/my-appointments",
        });
      }
    }
    return notices.sort((x, y) => x.at.localeCompare(y.at)).slice(0, 10);
  } catch {
    return [];
  }
};
