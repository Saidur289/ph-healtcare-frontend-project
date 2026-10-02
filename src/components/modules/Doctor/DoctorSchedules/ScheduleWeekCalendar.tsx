"use client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNow } from "@/hooks/useNow";
import { cn } from "@/lib/utils";
import { getMyDoctorSchedules } from "@/services/doctorSchedule.services";
import { type IDoctorSchedule } from "@/types/doctorSchedule.types";
import { useQuery } from "@tanstack/react-query";
import { addDays, addWeeks, format, isSameDay, startOfWeek } from "date-fns";
import { ChevronLeft, ChevronRight, Lock } from "lucide-react";
import { useMemo, useState } from "react";
import BookScheduleModal from "./BookScheduleModal";
import DeleteMyScheduleConfirmationDialog from "./DeleteMyScheduleConfirmationDialog";

// One week of the doctor's own slots. Free slots can be removed; booked ones are locked.
const ScheduleWeekCalendar = () => {
  const now = useNow(60_000);
  const [weekOffset, setWeekOffset] = useState(0);
  const [removing, setRemoving] = useState<IDoctorSchedule | null>(null);

  // the clock is unknown on the first render (now = 0); the query waits for it
  const weekStart = useMemo(
    () => (now ? addWeeks(startOfWeek(new Date(now), { weekStartsOn: 0 }), weekOffset) : null),
    [now, weekOffset],
  );
  const days = weekStart ? Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)) : [];

  const queryString = weekStart
    ? new URLSearchParams({
        limit: "1000",
        "schedule.startDateTime[gte]": weekStart.toISOString(),
        "schedule.startDateTime[lt]": addDays(weekStart, 7).toISOString(),
      }).toString()
    : "";

  // key starts with "my-doctor-schedules" so booking / deleting refreshes the calendar too
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["my-doctor-schedules", "week", queryString],
    queryFn: () => getMyDoctorSchedules(queryString),
    enabled: Boolean(weekStart),
  });

  const slots = useMemo(
    () =>
      [...(data?.data ?? [])].sort(
        (a, b) => new Date(a.schedule?.startDateTime ?? 0).getTime() - new Date(b.schedule?.startDateTime ?? 0).getTime(),
      ),
    [data],
  );
  const booked = slots.filter((s) => s.isBooked).length;
  // free slots that can still be booked (past ones no longer count)
  const open = slots.filter((s) => !s.isBooked && new Date(s.schedule?.startDateTime ?? 0).getTime() >= now).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" aria-label="Previous week" onClick={() => setWeekOffset((w) => w - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setWeekOffset(0)} disabled={weekOffset === 0}>
            This week
          </Button>
          <Button variant="outline" size="icon" aria-label="Next week" onClick={() => setWeekOffset((w) => w + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <p className="ml-1 text-sm font-medium" aria-live="polite">
            {weekStart ? `${format(weekStart, "dd MMM")} – ${format(addDays(weekStart, 6), "dd MMM yyyy")}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-xs text-muted-foreground">
            {open} open · {booked} booked
          </p>
          <BookScheduleModal />
        </div>
      </div>

      {isError ? (
        <div className="rounded-xl border border-dashed bg-card p-6 text-center text-[13px] text-muted-foreground">
          Could not load this week.{" "}
          <button type="button" className="font-medium text-primary hover:underline" onClick={() => void refetch()}>
            Try again
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7">
          {(days.length ? days : Array.from({ length: 7 }, () => null)).map((day, index) => {
            const daySlots = day ? slots.filter((s) => s.schedule && isSameDay(new Date(s.schedule.startDateTime), day)) : [];
            const isToday = day && now ? isSameDay(day, new Date(now)) : false;
            return (
              <div
                key={day ? day.toISOString() : index}
                className={cn("min-h-28 rounded-xl border bg-card p-3", isToday && "border-primary ring-1 ring-primary/30")}
              >
                <p className={cn("text-xs font-semibold", isToday ? "text-primary" : "text-muted-foreground")}>
                  {day ? format(day, "EEE dd") : <Skeleton className="h-3 w-12" />}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5 lg:flex-col">
                  {isLoading || !day ? (
                    <Skeleton className="h-7 w-full" />
                  ) : daySlots.length === 0 ? (
                    <p className="text-xs text-muted-foreground/70">No slots</p>
                  ) : (
                    daySlots.map((slot) => {
                      const start = new Date(slot.schedule!.startDateTime);
                      const past = start.getTime() < now;
                      const label = format(start, "hh:mm a");
                      return slot.isBooked ? (
                        <span
                          key={slot.scheduleId}
                          title="Booked by a patient"
                          className="flex items-center justify-between gap-1 rounded-lg bg-info-soft px-2 py-1 text-xs font-medium text-primary"
                        >
                          {label} <Lock className="h-3 w-3" aria-label="booked" />
                        </span>
                      ) : (
                        <button
                          key={slot.scheduleId}
                          type="button"
                          disabled={past}
                          onClick={() => setRemoving(slot)}
                          title={past ? "This slot has passed" : "Open slot. Click to remove it"}
                          aria-label={`Open slot ${format(start, "EEE dd MMM")} ${label}${past ? " (past)" : ", remove"}`}
                          className="rounded-lg border border-success/30 bg-success-soft px-2 py-1 text-left text-xs font-medium text-success transition-colors hover:border-destructive hover:bg-danger-soft hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default disabled:opacity-50 disabled:hover:border-success/30 disabled:hover:bg-success-soft disabled:hover:text-success"
                        >
                          {label}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        Green = open for booking (click to remove). Blue = booked by a patient. The week starts on Sunday.
      </p>

      <DeleteMyScheduleConfirmationDialog
        open={Boolean(removing)}
        onOpenChange={(open) => !open && setRemoving(null)}
        doctorSchedule={removing}
      />
    </div>
  );
};

export default ScheduleWeekCalendar;
