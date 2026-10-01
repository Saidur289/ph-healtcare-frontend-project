"use client";
import StatusPill from "@/components/shared/StatusPill";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNow } from "@/hooks/useNow";
import { formatDay, formatTime, isJoinable, upcomingAppointments } from "@/lib/appointmentUtils";
import { initials } from "@/lib/userDisplay";
import { IAppointment } from "@/types/appointment.types";
import { CalendarPlus, Clock, Video } from "lucide-react";
import Link from "next/link";

// the patient's next consultation, with Join / Pay buttons when they apply
const NextAppointmentCard = ({ appointments }: { appointments: IAppointment[] }) => {
  const now = useNow();
  const next = upcomingAppointments(appointments, now)[0];

  if (!next) {
    return (
      <Card className="items-center gap-3 p-8 text-center shadow-xs">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-primary">
          <CalendarPlus className="h-5 w-5" aria-hidden />
        </span>
        <p className="text-sm font-medium">No upcoming appointment</p>
        <p className="text-[13px] text-muted-foreground">Find a doctor and book a video consultation.</p>
        <Button asChild size="sm">
          <Link href="/consultation">Book appointment</Link>
        </Button>
      </Card>
    );
  }

  const doctorName = `Dr. ${next.doctor?.name ?? ""}`;
  return (
    <Card className="gap-4 p-5 shadow-xs">
      <div className="flex items-center justify-between">
        <p className="text-[15px] font-semibold">Next appointment</p>
        <StatusPill tone="green">
          <Video className="h-3 w-3" aria-hidden /> Video Consult
        </StatusPill>
      </div>
      <div className="flex items-center gap-3">
        <Avatar className="h-11 w-11">
          <AvatarImage src={next.doctor?.profilePhoto || undefined} alt="" />
          <AvatarFallback className="bg-accent text-sm font-semibold text-accent-foreground">
            {initials(next.doctor?.name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{doctorName}</p>
          <p className="truncate text-xs text-muted-foreground">{next.doctor?.designation ?? "Doctor"}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Clock className="h-4 w-4" aria-hidden />
          {formatDay(next.schedule?.startDateTime)} · {formatTime(next.schedule?.startDateTime)}
        </span>
        <StatusPill status={next.paymentStatus} />
      </div>
      <div className="flex flex-wrap gap-2">
        {isJoinable(next, now) ? (
          <Button asChild size="sm">
            <Link href={`/consultation/room/${next.id}`}>Join Now</Link>
          </Button>
        ) : next.paymentStatus === "UNPAID" ? (
          <Button asChild size="sm">
            <Link href="/dashboard/my-appointments">Pay now</Link>
          </Button>
        ) : (
          <Button asChild size="sm" variant="outline">
            <Link href={`/consultation/room/${next.id}`}>Open waiting room</Link>
          </Button>
        )}
        <Button asChild size="sm" variant="ghost">
          <Link href="/dashboard/my-appointments">All appointments</Link>
        </Button>
      </div>
    </Card>
  );
};

export default NextAppointmentCard;
