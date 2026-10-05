"use client";

import { MorphDialog } from "@/components/motion/MorphDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { springs, staggerContainer, staggerItem } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { getDoctorById } from "@/services/doctor.services";
import { type IDoctorScheduleItem } from "@/types/doctor.types";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarPlus, Check, Clock3, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

interface BookAppointmentModalProps {
  doctorId: string;
  doctorName?: string;
  isAuthenticated: boolean;
  viewerRole?: string | null;
  triggerClassName?: string;
  fullWidth?: boolean;
}

const formatDateTime = (value?: string | Date | null) => {
  if (!value) {
    return "N/A";
  }

  const dateValue = new Date(value);
  if (Number.isNaN(dateValue.getTime())) {
    return "N/A";
  }

  return format(dateValue, "EEE, MMM dd • hh:mm a");
};

// The "Book Appointment" button grows into the slot picker (MorphDialog) and shrinks back on close.
const BookAppointmentModal = ({
  doctorId,
  doctorName,
  isAuthenticated,
  viewerRole,
  triggerClassName,
  fullWidth = false,
}: BookAppointmentModalProps) => {
  const [open, setOpen] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>("");

  const router = useRouter();

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["consultation-booking-doctor", doctorId],
    queryFn: () => getDoctorById(doctorId),
    enabled: open,
    staleTime: 1000 * 30,
  });

  const availableSchedules = useMemo<IDoctorScheduleItem[]>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (data?.data.doctorSchedules ?? [])
      .filter((item) => {
        if (
          item.isBooked ||
          !item.schedule?.id ||
          !item.schedule.startDateTime
        ) {
          return false;
        }

        const scheduleStart = new Date(item.schedule.startDateTime);
        if (Number.isNaN(scheduleStart.getTime())) {
          return false;
        }

        return scheduleStart >= today;
      })
      .sort((left, right) => {
        const leftValue = new Date(left.schedule?.startDateTime ?? 0).getTime();
        const rightValue = new Date(
          right.schedule?.startDateTime ?? 0,
        ).getTime();
        return leftValue - rightValue;
      });
  }, [data?.data.doctorSchedules]);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (!nextOpen) {
      setSelectedScheduleId("");
    }
  };

  const handleProceed = () => {
    if (!selectedScheduleId) {
      toast.error("Select a schedule slot first");
      return;
    }

    const targetPath = `/dashboard/book-appointments?doctorId=${encodeURIComponent(doctorId)}&scheduleId=${encodeURIComponent(selectedScheduleId)}`;

    if (!isAuthenticated) {
      setOpen(false);
      router.push(`/login?redirect=${encodeURIComponent(targetPath)}`);
      return;
    }

    if (viewerRole && viewerRole !== "PATIENT") {
      toast.error("Only patient accounts can book appointments");
      return;
    }

    setOpen(false);
    router.push(targetPath);
  };

  const isBusy = isLoading || isFetching;

  return (
    <MorphDialog
      layoutId={`book-${doctorId}`}
      open={open}
      onOpenChange={handleOpenChange}
      triggerClassName={triggerClassName}
      className="max-w-2xl"
      trigger={
        <Button type="button" className={cn("w-full", triggerClassName)} variant="outline">
          <CalendarPlus className="size-4" />
          Book Appointment
        </Button>
      }
    >
      <div className="space-y-1.5 border-b px-6 py-5 pr-14">
        <DialogTitle className="text-lg font-semibold">Book Appointment</DialogTitle>
        <DialogDescription className="text-muted-foreground">
          Choose one available slot for{" "}
          {doctorName || data?.data.name || "this doctor"} from today onward.
        </DialogDescription>
      </div>

      <ScrollArea className="max-h-[calc(90vh-10rem)]">
        <div className="space-y-4 px-6 py-5">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="secondary">Upcoming only</Badge>
            <Badge variant="secondary">One slot per booking</Badge>
            {!isAuthenticated && (
              <Badge variant="outline">Login required to continue</Badge>
            )}
          </div>

          {isBusy && (
            <div className="flex items-center gap-2 rounded-xl border p-4 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Loading available schedules...
            </div>
          )}

          {!isBusy && availableSchedules.length === 0 && (
            <div className="rounded-xl border p-4 text-sm text-muted-foreground">
              No available schedules from today onward.
            </div>
          )}

          {!isBusy && availableSchedules.length > 0 && (
            // slots cascade in; the selected one sits on a highlight that glides between choices
            <motion.div className="grid gap-3" variants={staggerContainer} initial="hidden" animate="show" role="group" aria-label="Available slots">
              {availableSchedules.map((item) => {
                const scheduleId = item.schedule?.id ?? "";
                const isSelected = selectedScheduleId === scheduleId;

                return (
                  <motion.button
                    key={scheduleId}
                    type="button"
                    aria-pressed={isSelected}
                    variants={staggerItem}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedScheduleId(scheduleId)}
                    className={cn(
                      "relative isolate rounded-2xl border p-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                      isSelected ? "border-primary" : "bg-card/60 hover:border-primary/40",
                    )}
                  >
                    {isSelected && (
                      <motion.span
                        layoutId={`book-${doctorId}-selected`}
                        transition={springs.pill}
                        className="absolute inset-0 -z-10 rounded-2xl bg-primary/8 shadow-[0_0_0_3px] shadow-primary/15"
                        aria-hidden
                      />
                    )}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="space-y-1">
                        <p className="font-medium">
                          {formatDateTime(item.schedule?.startDateTime)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Ends {formatDateTime(item.schedule?.endDateTime)}
                        </p>
                      </div>

                      <div className={cn("flex items-center gap-2 text-xs", isSelected ? "font-medium text-primary" : "text-muted-foreground")}>
                        {isSelected ? <Check className="size-3.5" aria-hidden /> : <Clock3 className="size-3.5" aria-hidden />}
                        <span>{isSelected ? "Selected" : "Tap to select"}</span>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </div>
      </ScrollArea>

      <div className="flex flex-col-reverse gap-2 border-t px-6 py-4 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => handleOpenChange(false)}
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleProceed}
          className={fullWidth ? "w-full sm:w-auto" : undefined}
        >
          {isAuthenticated ? "Proceed to Confirm" : "Login to Continue"}
        </Button>
      </div>
    </MorphDialog>
  );
};

export default BookAppointmentModal;
