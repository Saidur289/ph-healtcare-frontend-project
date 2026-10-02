"use client";
import AdminListTable from "@/components/modules/Admin/shared/AdminListTable";
import StatusPill from "@/components/shared/StatusPill";
import { formatDay } from "@/lib/appointmentUtils";
import { getPrescriptionsForAdmin } from "@/services/admin.services";
import { IAdminPrescription } from "@/types/admin.types";
import { ColumnDef } from "@tanstack/react-table";

// The API sends only metadata here: admins see who prescribed when and whether the
// PDF was emailed, never the medicines or instructions (medical data).
const columns: ColumnDef<IAdminPrescription>[] = [
  {
    id: "patient",
    header: "Patient",
    enableSorting: false,
    cell: ({ row }) => (
      <span className="text-[13px]">
        {row.original.patient?.name}
        <span className="block text-xs text-muted-foreground">{row.original.patient?.email}</span>
      </span>
    ),
  },
  {
    id: "doctor",
    header: "Doctor",
    enableSorting: false,
    cell: ({ row }) => (
      <span className="text-[13px]">
        Dr. {row.original.doctor?.name}
        <span className="block text-xs text-muted-foreground">{row.original.doctor?.designation}</span>
      </span>
    ),
  },
  { id: "createdAt", accessorKey: "createdAt", header: "Issued", cell: ({ row }) => formatDay(row.original.createdAt) },
  { id: "followUpDate", accessorKey: "followUpDate", header: "Follow-up", cell: ({ row }) => formatDay(row.original.followUpDate) },
  {
    id: "emailSentAt",
    accessorKey: "emailSentAt",
    header: "PDF email",
    cell: ({ row }) =>
      row.original.emailSentAt ? (
        <StatusPill tone="green">Sent {formatDay(row.original.emailSentAt)}</StatusPill>
      ) : (
        <StatusPill tone="amber">Pending</StatusPill>
      ),
  },
];

const AdminPrescriptionsTable = ({ initialQueryString }: { initialQueryString: string }) => (
  <AdminListTable<IAdminPrescription>
    queryKey="admin-prescriptions"
    fetcher={getPrescriptionsForAdmin}
    initialQueryString={initialQueryString}
    columns={columns}
    searchPlaceholder="Search by patient or doctor…"
    emptyMessage="No prescriptions yet."
  />
);

export default AdminPrescriptionsTable;
