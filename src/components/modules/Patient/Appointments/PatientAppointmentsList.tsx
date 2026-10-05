"use client";

import { initiateAppointmentPaymentAction } from "@/app/_actions/appointment.actions";
import { Magnetic } from "@/components/motion/Magnetic";
import EmptyState from "@/components/shared/EmptyState";
import StatusPill from "@/components/shared/StatusPill";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useNow } from "@/hooks/useNow";
import { formatDay, formatTaka, formatTime, isJoinable, slotEnd, slotStart } from "@/lib/appointmentUtils";
import { springs, staggerContainer, staggerItem } from "@/lib/motion";
import { initials } from "@/lib/userDisplay";
import { cn } from "@/lib/utils";
import { type IAppointment } from "@/types/appointment.types";
import { useMutation } from "@tanstack/react-query";
import { CalendarPlus, CreditCard, FileText, Receipt, Video } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import CancelAppointmentDialog from "./CancelAppointmentDialog";
import RescheduleDialog from "./RescheduleDialog";
import ReviewForm from "./ReviewForm";
import { toast } from "sonner";

// a patient may cancel or reschedule until 2 hours before the start (API rule)
const CHANGE_CUTOFF_MS = 2 * 60 * 60 * 1000;

const TABS = [
  { id: "upcoming", label: "Upcoming" },
  { id: "past", label: "Past" },
  { id: "cancelled", label: "Cancelled" },
] as const;
type TTab = (typeof TABS)[number]["id"];

const tabOf = (a: IAppointment, now: number): TTab => {
  if (a.status === "CANCELED") return "cancelled";
  if ((a.status === "SCHEDULED" || a.status === "INPROGRESS") && slotEnd(a) >= now) return "upcoming";
  return "past";
};

interface PatientAppointmentsListProps {
  appointments: IAppointment[];
  feedbackType?: "success" | "error";
  feedbackMessage?: string;
}

const PatientAppointmentsList = ({ appointments, feedbackType, feedbackMessage }: PatientAppointmentsListProps) => {
  const now = useNow();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const requested = searchParams.get("tab");
  const tab: TTab = TABS.some((t) => t.id === requested) ? (requested as TTab) : "upcoming";

  const payMutation = useMutation({ mutationFn: initiateAppointmentPaymentAction });

  // until the clock is known (first render) "now" is 0, so everything active counts as upcoming
  const groups = { upcoming: [] as IAppointment[], past: [] as IAppointment[], cancelled: [] as IAppointment[] };
  appointments.forEach((a) => groups[tabOf(a, now)].push(a));
  groups.upcoming.sort((x, y) => slotStart(x) - slotStart(y));
  groups.past.sort((x, y) => slotStart(y) - slotStart(x));
  groups.cancelled.sort((x, y) => slotStart(y) - slotStart(x));
  const list = groups[tab];

  const selectTab = (id: TTab) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", id);
    // drop one-off banners (payment result, pay-later) when switching tabs
    ["status", "payment", "appointment_id"].forEach((key) => params.delete(key));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const payNow = async (appointmentId: string) => {
    const result = await payMutation.mutateAsync(appointmentId);
    if (!result.success) return void toast.error(result.message || "Failed to start the payment");
    if (!result.data.paymentUrl) return void toast.error("Payment link is unavailable right now");
    window.location.assign(result.data.paymentUrl);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight md:text-2xl">My Appointments</h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">Join calls, pay, reschedule and review your consultations.</p>
        </div>
        <Magnetic>
          <Button asChild size="sm">
            <Link href="/consultation">
              <CalendarPlus className="h-4 w-4" aria-hidden /> Book appointment
            </Link>
          </Button>
        </Magnetic>
      </div>

      {feedbackType && feedbackMessage && (
        <Alert variant={feedbackType === "error" ? "destructive" : "default"}>
          <AlertDescription>{feedbackMessage}</AlertDescription>
        </Alert>
      )}

      <div role="tablist" aria-label="Appointments" className="glass inline-flex rounded-lg p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls="appointments-panel"
            onClick={() => selectTab(t.id)}
            className={cn(
              "relative isolate rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              tab === t.id ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab === t.id && (
              <motion.span
                layoutId="appointment-tab"
                transition={springs.pill}
                className="absolute inset-0 -z-10 rounded-md bg-primary shadow-[0_0_18px_-6px] shadow-primary"
                aria-hidden
              />
            )}
            {t.label}
            <span className={cn("ml-1.5 text-xs", tab === t.id ? "text-primary-foreground/80" : "text-muted-foreground")}>
              {groups[t.id].length}
            </span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={tab}
          id="appointments-panel"
          role="tabpanel"
          aria-labelledby={`tab-${tab}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0, transition: springs.page }}
          exit={{ opacity: 0, y: -4, transition: { duration: 0.12 } }}
        >
          {list.length === 0 ? (
            <EmptyState
              title={tab === "upcoming" ? "No upcoming appointments" : tab === "past" ? "No past appointments" : "No cancelled appointments"}
              description={tab === "upcoming" ? "Find a doctor and pick a free slot to book a video consultation." : undefined}
              action={
                tab === "upcoming" ? (
                  <Button asChild size="sm">
                    <Link href="/consultation">Find a doctor</Link>
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <motion.ul className="space-y-3" variants={staggerContainer} initial="hidden" animate="show">
              {list.map((a) => {
                const start = slotStart(a);
                const canChange = a.status === "SCHEDULED" && now > 0 && start - now > CHANGE_CUTOFF_MS;
                const canPay = a.paymentStatus === "UNPAID" && a.status === "SCHEDULED";
                const joinable = isJoinable(a, now);
                const doctorId = a.doctorId ?? a.doctor?.id;
                return (
                  <motion.li key={a.id} layout variants={staggerItem} className="glass rounded-xl p-4">
                    <div className="flex flex-wrap items-start gap-3">
                      <Avatar className="h-11 w-11">
                        <AvatarImage src={a.doctor?.profilePhoto || undefined} alt="" />
                        <AvatarFallback className="bg-accent text-sm font-semibold text-accent-foreground">{initials(a.doctor?.name)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">
                          {doctorId ? (
                            <Link href={`/consultation/doctor/${doctorId}`} className="hover:text-primary">
                              Dr. {a.doctor?.name}
                            </Link>
                          ) : (
                            `Dr. ${a.doctor?.name ?? ""}`
                          )}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">{a.doctor?.designation ?? "Consultation"}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-[13px]">
                          <span className="font-medium">
                            {formatDay(a.schedule?.startDateTime)} · {formatTime(a.schedule?.startDateTime)}
                          </span>
                          <StatusPill tone="green">
                            <Video className="h-3 w-3" aria-hidden /> Video
                          </StatusPill>
                          <StatusPill status={a.status} />
                          <StatusPill status={a.paymentStatus} />
                        </div>
                      </div>
                      <p className="text-sm font-semibold">{formatTaka(a.payment?.amount ?? a.doctor?.appointmentFee)}</p>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t pt-3">
                      {joinable && (
                        <Magnetic>
                          <Button asChild size="sm">
                            <Link href={`/consultation/room/${a.id}`}>
                              <Video className="h-4 w-4" aria-hidden /> Join call
                            </Link>
                          </Button>
                        </Magnetic>
                      )}
                      {!joinable && tab === "upcoming" && a.paymentStatus === "PAID" && (
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/consultation/room/${a.id}`}>Waiting room</Link>
                        </Button>
                      )}
                      {canPay && (
                        <Button size="sm" onClick={() => void payNow(a.id)} disabled={payMutation.isPending}>
                          <CreditCard className="h-4 w-4" aria-hidden />
                          {payMutation.isPending ? "Redirecting..." : "Pay now"}
                        </Button>
                      )}
                      {canChange && <RescheduleDialog appointment={a} />}
                      {canChange && <CancelAppointmentDialog appointment={a} />}
                      {a.status === "SCHEDULED" && now > 0 && !canChange && tab === "upcoming" && (
                        <span className="text-xs text-muted-foreground">Changes close 2 hours before the start</span>
                      )}
                      {a.prescription && (
                        <Button asChild size="sm" variant="outline">
                          {a.prescription.pdfUrl ? (
                            <a href={`/files/prescriptions/${a.prescription.id}`} target="_blank" rel="noopener noreferrer">
                              <FileText className="h-4 w-4" aria-hidden /> Prescription
                            </a>
                          ) : (
                            <Link href="/dashboard/my-prescriptions">
                              <FileText className="h-4 w-4" aria-hidden /> Prescription
                            </Link>
                          )}
                        </Button>
                      )}
                      {a.payment?.invoiceUrl && a.payment.id && (
                        <Button asChild size="sm" variant="ghost">
                          <a href={`/files/invoices/${a.payment.id}`} target="_blank" rel="noopener noreferrer">
                            <Receipt className="h-4 w-4" aria-hidden /> Invoice
                          </a>
                        </Button>
                      )}
                      {a.status === "COMPLETED" && !a.review && <ReviewForm appointmentId={a.id} />}
                      {a.review && <span className="text-xs text-muted-foreground">You rated {a.review.rating}/5</span>}
                    </div>
                  </motion.li>
                );
              })}
            </motion.ul>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default PatientAppointmentsList;
