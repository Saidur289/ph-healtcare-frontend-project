"use client";
import { completeAppointmentAction, markNoShowAction } from "@/app/_actions/consultation.actions";
import CancelAppointmentDialog from "@/components/modules/Patient/Appointments/CancelAppointmentDialog";
import EmptyState from "@/components/shared/EmptyState";
import StatusPill from "@/components/shared/StatusPill";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useNow } from "@/hooks/useNow";
import { formatDay, formatTaka, formatTime, isJoinable, slotEnd, slotStart } from "@/lib/appointmentUtils";
import { initials } from "@/lib/userDisplay";
import { cn } from "@/lib/utils";
import { IAppointment } from "@/types/appointment.types";
import { isSameDay } from "date-fns";
import { CheckCircle2, FileText, Search, UserX, Video } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { queryKeys } from "@/lib/queryKeys";

const NO_SHOW_AFTER_MS = 15 * 60 * 1000; // API rule

const TABS = [
  { id: "today", label: "Today" },
  { id: "upcoming", label: "Upcoming" },
  { id: "past", label: "Past" },
  { id: "cancelled", label: "Cancelled" },
] as const;
type TTab = (typeof TABS)[number]["id"];

const tabOf = (a: IAppointment, now: number): TTab => {
  if (a.status === "CANCELED") return "cancelled";
  const active = a.status === "SCHEDULED" || a.status === "INPROGRESS";
  if (now && isSameDay(new Date(slotStart(a)), new Date(now)) && (active || slotEnd(a) >= now)) return "today";
  if (active && slotEnd(a) >= now) return "upcoming";
  return "past";
};

const DoctorAppointmentsList = ({ appointments }: { appointments: IAppointment[] }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const now = useNow();

  const requested = searchParams.get("tab");
  const tab: TTab = TABS.some((t) => t.id === requested) ? (requested as TTab) : "today";
  // the navbar search sends ?searchTerm=
  const [term, setTerm] = useState(searchParams.get("searchTerm") ?? "");
  const needle = term.trim().toLowerCase();

  const groups: Record<TTab, IAppointment[]> = { today: [], upcoming: [], past: [], cancelled: [] };
  appointments
    .filter((a) => !needle || (a.patient?.name ?? "").toLowerCase().includes(needle) || (a.patient?.email ?? "").toLowerCase().includes(needle))
    .forEach((a) => groups[tabOf(a, now)].push(a));
  (["today", "upcoming"] as const).forEach((k) => groups[k].sort((x, y) => slotStart(x) - slotStart(y)));
  (["past", "cancelled"] as const).forEach((k) => groups[k].sort((x, y) => slotStart(y) - slotStart(x)));
  const list = groups[tab];

  const selectTab = (id: TTab) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", id);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const run = (id: string, action: (id: string) => Promise<{ success: boolean; message: string }>) => {
    setBusyId(id);
    startTransition(async () => {
      const result = await action(id);
      setBusyId(null);
      if (!result.success) return void toast.error(result.message);
      toast.success(result.message);
      router.refresh();
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" aria-label="Appointments" className="inline-flex flex-wrap rounded-lg border bg-card p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={tab === t.id}
              aria-controls="doctor-appointments-panel"
              onClick={() => selectTab(t.id)}
              className={cn(
                "rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                tab === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
              <span className={cn("ml-1.5 text-xs", tab === t.id ? "text-primary-foreground/80" : "text-muted-foreground")}>
                {groups[t.id].length}
              </span>
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <input
            type="search"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            maxLength={100}
            placeholder="Filter by patient"
            aria-label="Filter by patient name or email"
            className="h-9 w-full rounded-lg border bg-card pl-9 pr-3 text-[13px] outline-none focus:border-ring"
          />
        </div>
      </div>

      <div id="doctor-appointments-panel" role="tabpanel" aria-labelledby={`tab-${tab}`}>
        {list.length === 0 ? (
          <EmptyState
            title={needle ? "No patient matches your filter" : `No ${TABS.find((t) => t.id === tab)!.label.toLowerCase()} appointments`}
            description={tab === "today" && !needle ? "Open slots in My Schedules so patients can book you." : undefined}
            action={
              tab === "today" && !needle ? (
                <Button asChild size="sm" variant="outline">
                  <Link href="/doctor/dashboard/my-schedules">My Schedules</Link>
                </Button>
              ) : undefined
            }
          />
        ) : (
          <ul className="space-y-3">
            {list.map((a) => {
              const joinable = isJoinable(a, now);
              const busy = pending && busyId === a.id;
              const canNoShow = a.status === "SCHEDULED" && now > 0 && now >= slotStart(a) + NO_SHOW_AFTER_MS;
              const needsPrescription = (a.status === "INPROGRESS" || a.status === "COMPLETED") && !a.prescription;
              return (
                <li key={a.id} className="rounded-xl border bg-card p-4 shadow-xs">
                  <div className="flex flex-wrap items-start gap-3">
                    <Avatar className="h-11 w-11">
                      <AvatarFallback className="bg-accent text-sm font-semibold text-accent-foreground">{initials(a.patient?.name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{a.patient?.name ?? "Patient"}</p>
                      <p className="truncate text-xs text-muted-foreground">{a.patient?.email}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-[13px]">
                        <span className="font-medium">
                          {formatDay(a.schedule?.startDateTime)} · {formatTime(a.schedule?.startDateTime)} – {formatTime(a.schedule?.endDateTime)}
                        </span>
                        <StatusPill status={a.status} />
                        <StatusPill status={a.paymentStatus} />
                      </div>
                    </div>
                    <p className="text-sm font-semibold">{formatTaka(a.payment?.amount)}</p>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t pt-3">
                    {joinable && (
                      <Button asChild size="sm">
                        <Link href={`/consultation/room/${a.id}`}>
                          <Video className="h-4 w-4" aria-hidden /> {a.status === "INPROGRESS" ? "Rejoin call" : "Start call"}
                        </Link>
                      </Button>
                    )}
                    {a.status === "INPROGRESS" && (
                      <Button size="sm" variant="outline" disabled={busy} onClick={() => run(a.id, completeAppointmentAction)}>
                        <CheckCircle2 className="h-4 w-4" aria-hidden /> {busy ? "Completing..." : "Complete"}
                      </Button>
                    )}
                    {needsPrescription && (
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/doctor/dashboard/prescriptions?appointmentId=${encodeURIComponent(a.id)}`}>
                          <FileText className="h-4 w-4" aria-hidden /> Write prescription
                        </Link>
                      </Button>
                    )}
                    {a.prescription?.pdfUrl && (
                      <Button asChild size="sm" variant="ghost">
                        <a href={`/files/prescriptions/${a.prescription.id}`} target="_blank" rel="noopener noreferrer">
                          <FileText className="h-4 w-4" aria-hidden /> Prescription PDF
                        </a>
                      </Button>
                    )}
                    {canNoShow && (
                      <Button size="sm" variant="outline" disabled={busy} onClick={() => run(a.id, markNoShowAction)}>
                        <UserX className="h-4 w-4" aria-hidden /> No-show
                      </Button>
                    )}
                    {a.status === "SCHEDULED" && <CancelAppointmentDialog appointment={a} who="doctor" />}
                    {a.status === "SCHEDULED" && a.paymentStatus !== "PAID" && (
                      <span className="text-xs text-muted-foreground">Waiting for payment</span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default DoctorAppointmentsList;
