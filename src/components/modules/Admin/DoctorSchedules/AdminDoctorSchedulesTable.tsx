"use client";
import AdminListTable from "@/components/modules/Admin/shared/AdminListTable";
import UserInfoCell from "@/components/shared/cell/UserInfoCell";
import StatusPill from "@/components/shared/StatusPill";
import { serverManagedFilter } from "@/hooks/useServerManagedDataTableFilters";
import { formatDay, formatTime } from "@/lib/appointmentUtils";
import { getDoctorSchedulesForAdmin } from "@/services/admin.services";
import { IAdminDoctorSchedule } from "@/types/admin.types";
import { ColumnDef } from "@tanstack/react-table";

const columns: ColumnDef<IAdminDoctorSchedule>[] = [
  {
    id: "doctor",
    header: "Doctor",
    enableSorting: false,
    cell: ({ row }) => <UserInfoCell name={`Dr. ${row.original.doctor?.name ?? ""}`} email={row.original.doctor?.email} profilePhoto={row.original.doctor?.profilePhoto} />,
  },
  {
    id: "schedule.startDateTime",
    header: "Slot",
    cell: ({ row }) => (
      <span className="whitespace-nowrap">
        {formatDay(row.original.schedule?.startDateTime)}
        <span className="block text-xs text-muted-foreground">
          {formatTime(row.original.schedule?.startDateTime)} – {formatTime(row.original.schedule?.endDateTime)}
        </span>
      </span>
    ),
  },
  {
    id: "isBooked",
    accessorKey: "isBooked",
    header: "Status",
    cell: ({ row }) => (row.original.isBooked ? <StatusPill tone="blue">Booked</StatusPill> : <StatusPill tone="green">Open</StatusPill>),
  },
  { id: "createdAt", accessorKey: "createdAt", header: "Added", cell: ({ row }) => formatDay(row.original.createdAt) },
];

const RANGE_KEY = "schedule.startDateTime";

const AdminDoctorSchedulesTable = ({ initialQueryString }: { initialQueryString: string }) => (
  <AdminListTable<IAdminDoctorSchedule>
    queryKey="admin-doctor-schedules"
    fetcher={getDoctorSchedulesForAdmin}
    initialQueryString={initialQueryString}
    columns={columns}
    searchPlaceholder="Search by doctor or schedule id…"
    emptyMessage="No doctor slots found."
    filterDefinitions={[serverManagedFilter.single("isBooked"), serverManagedFilter.range(RANGE_KEY)]}
    filterConfigs={[
      {
        id: "isBooked",
        label: "Status",
        type: "single-select",
        options: [
          { label: "Open", value: "false" },
          { label: "Booked", value: "true" },
        ],
      },
      { id: RANGE_KEY, label: "Slot date", type: "range", inputType: "date" },
    ]}
  />
);

export default AdminDoctorSchedulesTable;
