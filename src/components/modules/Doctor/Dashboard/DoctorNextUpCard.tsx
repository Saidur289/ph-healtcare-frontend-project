"use client";
import MedicalHistoryMorph from "@/components/modules/Doctor/Appointments/MedicalHistoryMorph";
import { Magnetic } from "@/components/motion/Magnetic";
import { TiltCard } from "@/components/motion/TiltCard";
import StatusPill from "@/components/shared/StatusPill";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNow } from "@/hooks/useNow";
import { formatDay, formatTime, isJoinable, upcomingAppointments } from "@/lib/appointmentUtils";
import { initials } from "@/lib/userDisplay";
import { IAppointment } from "@/types/appointment.types";
import { CalendarClock, Clock, Video } from "lucide-react";
import Link from "next/link";

// The doctor's next patient: the most important card on the dashboard, so it tilts toward the
// pointer; Start call is magnetic once the call window opens.
const DoctorNextUpCard = ({ appointments }: { appointments: IAppointment[] }) => {
  const now = useNow();
  const next = upcomingAppointments(appointments, now)[0];

  if (!next) {
    return (
      <Card className="items-center gap-2 p-6 text-center shadow-xs">
        <CalendarClock className="h-6 w-6 text-muted-foreground" aria-hidden />
        <p className="text-sm font-medium">No patient waiting</p>
        <p className="text-[13px] text-muted-foreground">Your next booked consultation will show up here.</p>
      </Card>
    );
  }

  const joinable = isJoinable(next, now);
  return (
    <TiltCard className="rounded-xl">
      <Card className="gap-4 p-5 shadow-xs">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[15px] font-semibold">Next patient</p>
          <StatusPill status={next.paymentStatus} />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Avatar className="h-11 w-11">
            <AvatarFallback className="bg-accent text-sm font-semibold text-accent-foreground">{initials(next.patient?.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{next.patient?.name ?? "Patient"}</p>
            <p className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
              <Clock className="h-3.5 w-3.5" aria-hidden />
              {formatDay(next.schedule?.startDateTime)} · {formatTime(next.schedule?.startDateTime)}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {joinable ? (
            <Magnetic>
              <Button asChild size="sm">
                <Link href={`/consultation/room/${next.id}`}>
                  <Video className="h-4 w-4" aria-hidden /> {next.status === "INPROGRESS" ? "Rejoin call" : "Start call"}
                </Link>
              </Button>
            </Magnetic>
          ) : (
            <span className="text-xs text-muted-foreground">
              {next.paymentStatus === "PAID" ? "The call opens 10 minutes before the start" : "Waiting for payment"}
            </span>
          )}
          <MedicalHistoryMorph appointmentId={next.id} patientName={next.patient?.name} />
        </div>
      </Card>
    </TiltCard>
  );
};

export default DoctorNextUpCard;
