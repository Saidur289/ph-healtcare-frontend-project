"use client";
import { rescheduleAppointmentAction } from "@/app/_actions/patientAppointment.actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { getDoctorById } from "@/services/doctor.services";
import { IAppointment } from "@/types/appointment.types";
import { useNow } from "@/hooks/useNow";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { queryKeys } from "@/lib/queryKeys";

// pick another free slot of the same doctor (API: PATCH /appointments/reschedule/:id)
const RescheduleDialog = ({ appointment }: { appointment: IAppointment }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("");
  const [pending, startTransition] = useTransition();
  const doctorId = appointment.doctorId ?? appointment.doctor?.id ?? "";

  const { data, isLoading, isError } = useQuery({
    queryKey: ["consultation-booking-doctor", doctorId],
    queryFn: () => getDoctorById(doctorId),
    enabled: open && Boolean(doctorId),
    staleTime: 30 * 1000,
  });

  // free future slots grouped by day
  const now = useNow();
  const days = useMemo(() => {
    const groups = new Map<string, { label: string; slots: { id: string; time: string }[] }>();
    (data?.data?.doctorSchedules ?? [])
      .filter((s) => !s.isBooked && s.schedule?.id && s.schedule.startDateTime && new Date(s.schedule.startDateTime).getTime() > now)
      .filter((s) => s.schedule!.id !== appointment.scheduleId)
      .sort((a, b) => new Date(a.schedule!.startDateTime!).getTime() - new Date(b.schedule!.startDateTime!).getTime())
      .forEach((s) => {
        const start = new Date(s.schedule!.startDateTime!);
        const key = format(start, "yyyy-MM-dd");
        if (!groups.has(key)) groups.set(key, { label: format(start, "EEE, dd MMM"), slots: [] });
        groups.get(key)!.slots.push({ id: s.schedule!.id!, time: format(start, "hh:mm a") });
      });
    return [...groups.entries()];
  }, [data, appointment.scheduleId, now]);

  const confirm = () =>
    startTransition(async () => {
      const result = await rescheduleAppointmentAction(appointment.id, selected);
      if (!result.success) return void toast.error(result.message);
      toast.success(result.message);
      setOpen(false);
      setSelected("");
      router.refresh();
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
    });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (pending) return;
        setOpen(next);
        if (!next) setSelected("");
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          Reschedule
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Choose a new time</DialogTitle>
          <DialogDescription>Free slots of Dr. {appointment.doctor?.name}. Your payment moves with the appointment.</DialogDescription>
        </DialogHeader>
        <div className="max-h-80 space-y-4 overflow-y-auto pr-1">
          {isLoading ? (
            <div className="flex justify-center py-8 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" aria-label="Loading slots" />
            </div>
          ) : isError ? (
            <p className="py-6 text-center text-[13px] text-destructive">Could not load the doctor&apos;s slots.</p>
          ) : days.length === 0 ? (
            <p className="py-6 text-center text-[13px] text-muted-foreground">No other free slots right now.</p>
          ) : (
            days.map(([key, day]) => (
              <div key={key}>
                <p className="mb-2 text-[13px] font-medium">{day.label}</p>
                <div role="radiogroup" aria-label={day.label} className="flex flex-wrap gap-2">
                  {day.slots.map((slot) => (
                    <button
                      key={slot.id}
                      type="button"
                      role="radio"
                      aria-checked={selected === slot.id}
                      onClick={() => setSelected(slot.id)}
                      className={cn(
                        "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        selected === slot.id ? "border-primary bg-primary text-primary-foreground" : "bg-info-soft text-primary hover:border-primary",
                      )}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
            Close
          </Button>
          <Button onClick={confirm} disabled={!selected || pending}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
            {pending ? "Saving..." : "Move appointment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RescheduleDialog;
