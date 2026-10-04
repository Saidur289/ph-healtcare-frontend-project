"use client";
import { adminCancelAppointmentAction } from "@/app/_actions/admin.actions";
import AdminListTable from "@/components/modules/Admin/shared/AdminListTable";
import ConfirmActionDialog from "@/components/modules/Admin/shared/ConfirmActionDialog";
import UserInfoCell from "@/components/shared/cell/UserInfoCell";
import StatusPill from "@/components/shared/StatusPill";
import { Button } from "@/components/ui/button";
import { serverManagedFilter } from "@/hooks/useServerManagedDataTableFilters";
import { formatDay, formatTaka, formatTime } from "@/lib/appointmentUtils";
import { getAppointmentsForAdmin } from "@/services/admin.services";
import { IAdminAppointment } from "@/types/admin.types";
import { ColumnDef } from "@tanstack/react-table";
import { Receipt } from "lucide-react";

const columns: ColumnDef<IAdminAppointment>[] = [
  {
    id: "patient",
    header: "Patient",
    enableSorting: false,
    cell: ({ row }) => <UserInfoCell name={row.original.patient?.name ?? "Patient"} email={row.original.patient?.email} />,
  },
  { id: "doctor", header: "Doctor", enableSorting: false, cell: ({ row }) => `Dr. ${row.original.doctor?.name ?? ""}` },
  {
    id: "schedule.startDateTime",
    header: "Slot",
    cell: ({ row }) => (
      <span className="whitespace-nowrap">
        {formatDay(row.original.schedule?.startDateTime)}
        <span className="block text-xs text-muted-foreground">{formatTime(row.original.schedule?.startDateTime)}</span>
      </span>
    ),
  },
  { id: "status", accessorKey: "status", header: "Status", cell: ({ row }) => <StatusPill status={row.original.status} /> },
  {
    id: "paymentStatus",
    accessorKey: "paymentStatus",
    header: "Payment",
    cell: ({ row }) => (
      <span className="flex flex-col gap-0.5">
        <StatusPill status={row.original.paymentStatus} />
        <span className="text-xs text-muted-foreground">{formatTaka(row.original.payment?.amount ?? row.original.doctor?.appointmentFee)}</span>
      </span>
    ),
  },
];

const RANGE_KEY = "schedule.startDateTime";

const AdminAppointmentsTable = ({ initialQueryString }: { initialQueryString: string }) => (
  <AdminListTable<IAdminAppointment>
    queryKey="admin-appointments"
    fetcher={getAppointmentsForAdmin}
    initialQueryString={initialQueryString}
    columns={columns}
    searchPlaceholder="Search by patient, doctor or appointment id…"
    emptyMessage="No appointments found."
    filterDefinitions={[
      serverManagedFilter.single("status"),
      serverManagedFilter.single("paymentStatus"),
      serverManagedFilter.range(RANGE_KEY),
    ]}
    filterConfigs={[
      {
        id: "status",
        label: "Status",
        type: "single-select",
        options: ["SCHEDULED", "INPROGRESS", "COMPLETED", "CANCELED", "NO_SHOW"].map((value) => ({
          value,
          label: value === "INPROGRESS" ? "In progress" : value === "NO_SHOW" ? "No show" : value.charAt(0) + value.slice(1).toLowerCase(),
        })),
      },
      {
        id: "paymentStatus",
        label: "Payment",
        type: "single-select",
        options: ["PAID", "UNPAID", "EXPIRED", "REFUNDED"].map((value) => ({ value, label: value.charAt(0) + value.slice(1).toLowerCase() })),
      },
      { id: RANGE_KEY, label: "Slot date", type: "range", inputType: "date" },
    ]}
    rowActions={(a) => (
      <>
        {a.payment?.invoiceUrl && a.payment.id && (
          <Button asChild size="sm" variant="ghost" className="h-8">
            <a href={`/files/invoices/${a.payment.id}`} target="_blank" rel="noopener noreferrer" aria-label="Open invoice">
              <Receipt className="h-4 w-4" aria-hidden />
            </a>
          </Button>
        )}
        {a.status === "SCHEDULED" && (
          <ConfirmActionDialog
            trigger="Cancel"
            title="Cancel this appointment?"
            description={
              a.paymentStatus === "PAID"
                ? `The patient (${a.patient?.name}) is refunded automatically and the slot is released.`
                : "The slot is released for other patients."
            }
            confirmLabel="Cancel appointment"
            destructive
            withReason={{ label: "Reason (shown on the appointment)" }}
            onConfirm={(reason) => adminCancelAppointmentAction(a.id, reason)}
            invalidate={["admin-appointments", "admin-payments", "admin-dashboard-data"]}
          />
        )}
      </>
    )}
  />
);

export default AdminAppointmentsTable;
