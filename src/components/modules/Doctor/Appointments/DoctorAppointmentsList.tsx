"use client";
import { completeAppointmentAction } from "@/app/_actions/consultation.actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IAppointment } from "@/types/appointment.types";
import { format } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useNow } from "@/hooks/useNow";
import { toast } from "sonner";

const OPENS_BEFORE_MS = 10 * 60 * 1000; // same rule as the API

const isJoinable = (a: IAppointment, now: number) => {
  if (a.paymentStatus !== "PAID") return false;
  if (a.status !== "SCHEDULED" && a.status !== "INPROGRESS") return false;
  const start = new Date(a.schedule?.startDateTime ?? 0).getTime();
  const end = new Date(a.schedule?.endDateTime ?? 0).getTime();
  return now >= start - OPENS_BEFORE_MS && now <= end;
};

const DoctorAppointmentsList = ({ appointments }: { appointments: IAppointment[] }) => {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const now = useNow();
  const upcoming = appointments
    .filter((a) => a.status === "SCHEDULED" || a.status === "INPROGRESS")
    .sort((a, b) => new Date(a.schedule?.startDateTime ?? 0).getTime() - new Date(b.schedule?.startDateTime ?? 0).getTime());
  const past = appointments.filter((a) => a.status !== "SCHEDULED" && a.status !== "INPROGRESS");

  const complete = (id: string) =>
    startTransition(async () => {
      const result = await completeAppointmentAction(id);
      if (!result.success) return void toast.error(result.message);
      toast.success(result.message);
      router.refresh();
    });

  const row = (a: IAppointment) => (
    <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3">
      <div>
        <p className="font-medium">{a.patient?.name ?? "Patient"}</p>
        <p className="text-sm text-muted-foreground">
          {a.schedule?.startDateTime ? format(new Date(a.schedule.startDateTime), "EEE, MMM d • hh:mm a") : "N/A"}
        </p>
        <div className="mt-1 flex gap-2">
          <Badge variant="outline">{a.status}</Badge>
          <Badge variant={a.paymentStatus === "PAID" ? "default" : "secondary"}>{a.paymentStatus}</Badge>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {isJoinable(a, now) && (
          <Button asChild size="sm">
            <Link href={`/consultation/room/${a.id}`}>Join call</Link>
          </Button>
        )}
        {a.status === "INPROGRESS" && (
          <Button size="sm" variant="outline" disabled={pending} onClick={() => complete(a.id)}>
            Complete
          </Button>
        )}
        {(a.status === "INPROGRESS" || a.status === "COMPLETED") && !a.prescription && (
          <Button asChild size="sm" variant="outline">
            <Link href={`/doctor/dashboard/prescriptions?appointmentId=${a.id}`}>Write prescription</Link>
          </Button>
        )}
        {a.prescription?.pdfUrl && (
          <Button asChild size="sm" variant="ghost">
            <a href={a.prescription.pdfUrl} target="_blank" rel="noopener noreferrer">Prescription PDF</a>
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upcoming</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {upcoming.length ? upcoming.map(row) : <p className="text-sm text-muted-foreground">No upcoming appointments.</p>}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Past</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {past.length ? past.map(row) : <p className="text-sm text-muted-foreground">No past appointments.</p>}
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorAppointmentsList;
