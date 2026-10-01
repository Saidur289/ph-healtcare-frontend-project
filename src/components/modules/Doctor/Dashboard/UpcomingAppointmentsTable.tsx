"use client";
import UserInfoCell from "@/components/shared/cell/UserInfoCell";
import StatusPill from "@/components/shared/StatusPill";
import DataTable from "@/components/shared/table/DataTable";
import { Button } from "@/components/ui/button";
import { useNow } from "@/hooks/useNow";
import { formatDay, formatTime, isJoinable, upcomingAppointments } from "@/lib/appointmentUtils";
import { IAppointment } from "@/types/appointment.types";
import { ColumnDef } from "@tanstack/react-table";
import { Video } from "lucide-react";
import Link from "next/link";

const columns: ColumnDef<IAppointment>[] = [
  {
    id: "patient",
    header: "Patient",
    cell: ({ row }) => <UserInfoCell name={row.original.patient?.name ?? "Patient"} email={row.original.patient?.email} />,
  },
  { id: "date", header: "Date", cell: ({ row }) => formatDay(row.original.schedule?.startDateTime) },
  { id: "time", header: "Time", cell: ({ row }) => formatTime(row.original.schedule?.startDateTime) },
  {
    id: "type",
    header: "Type",
    // every consultation in this app is a video call
    cell: () => (
      <StatusPill tone="green">
        <Video className="h-3 w-3" aria-hidden /> Video Consult
      </StatusPill>
    ),
  },
  { id: "payment", header: "Payment", cell: ({ row }) => <StatusPill status={row.original.paymentStatus} /> },
];

// "Upcoming Appointments" card: the next 5, with "Join Now" once the call window opens
const UpcomingAppointmentsTable = ({ appointments }: { appointments: IAppointment[] }) => {
  const now = useNow();
  // until the clock is known (first render), keep the server order: active ones by start time
  const rows = upcomingAppointments(appointments, now).slice(0, 5);

  return (
    <DataTable
      title="Upcoming Appointments"
      viewAllHref="/doctor/dashboard/appointments"
      data={rows}
      columns={columns}
      emptyMessage="No upcoming appointments."
      rowActions={(a) =>
        isJoinable(a, now) ? (
          <Button asChild size="sm" className="h-8">
            <Link href={`/consultation/room/${a.id}`}>Join Now</Link>
          </Button>
        ) : a.paymentStatus === "PAID" ? (
          <Button size="sm" variant="outline" className="h-8" disabled title="Opens 10 minutes before the start">
            Join Now
          </Button>
        ) : (
          <span className="text-xs text-muted-foreground">Awaiting payment</span>
        )
      }
    />
  );
};

export default UpcomingAppointmentsTable;
