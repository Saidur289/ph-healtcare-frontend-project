"use client";
import { adminCancelAppointmentAction } from "@/app/_actions/admin.actions";
import AdminListTable from "@/components/modules/Admin/shared/AdminListTable";
import ConfirmActionDialog from "@/components/modules/Admin/shared/ConfirmActionDialog";
import UserInfoCell from "@/components/shared/cell/UserInfoCell";
import StatusPill from "@/components/shared/StatusPill";
import { Button } from "@/components/ui/button";
import { serverManagedFilter } from "@/hooks/useServerManagedDataTableFilters";
import { formatDay, formatTaka, formatTime } from "@/lib/appointmentUtils";
import { getPaymentsForAdmin } from "@/services/admin.services";
import { IAdminPayment } from "@/types/admin.types";
import { ColumnDef } from "@tanstack/react-table";
import { Receipt } from "lucide-react";

const columns: ColumnDef<IAdminPayment>[] = [
  {
    id: "invoiceNumber",
    accessorKey: "invoiceNumber",
    header: "Invoice",
    cell: ({ row }) => <span className="font-mono text-xs">{row.original.invoiceNumber ?? "—"}</span>,
  },
  {
    id: "patient",
    header: "Patient",
    enableSorting: false,
    cell: ({ row }) => (
      <UserInfoCell name={row.original.appointment?.patient?.name ?? "Patient"} email={row.original.appointment?.patient?.email} />
    ),
  },
  {
    id: "doctor",
    header: "Doctor",
    enableSorting: false,
    cell: ({ row }) => (
      <span>
        Dr. {row.original.appointment?.doctor?.name}
        <span className="block text-xs text-muted-foreground">
          {formatDay(row.original.appointment?.schedule?.startDateTime)} · {formatTime(row.original.appointment?.schedule?.startDateTime)}
        </span>
      </span>
    ),
  },
  { id: "amount", accessorKey: "amount", header: "Amount", cell: ({ row }) => <span className="font-medium">{formatTaka(row.original.amount)}</span> },
  { id: "status", accessorKey: "status", header: "Status", cell: ({ row }) => <StatusPill status={row.original.status} /> },
  {
    id: "paidAt",
    accessorKey: "paidAt",
    header: "Paid / refunded",
    cell: ({ row }) =>
      row.original.refundedAt ? (
        <span className="text-xs">Refunded {formatDay(row.original.refundedAt)}</span>
      ) : row.original.paidAt ? (
        <span className="text-xs">{formatDay(row.original.paidAt)}</span>
      ) : (
        "—"
      ),
  },
];

const AdminPaymentsTable = ({ initialQueryString }: { initialQueryString: string }) => (
  <AdminListTable<IAdminPayment>
    queryKey="admin-payments"
    fetcher={getPaymentsForAdmin}
    initialQueryString={initialQueryString}
    columns={columns}
    searchPlaceholder="Search by invoice no., patient or doctor…"
    emptyMessage="No payments found."
    filterDefinitions={[
      serverManagedFilter.single("status"),
      serverManagedFilter.range("amount"),
      serverManagedFilter.range("paidAt"),
    ]}
    filterConfigs={[
      {
        id: "status",
        label: "Status",
        type: "single-select",
        options: ["PAID", "UNPAID", "EXPIRED", "REFUNDED"].map((value) => ({ value, label: value.charAt(0) + value.slice(1).toLowerCase() })),
      },
      { id: "amount", label: "Amount (BDT)", type: "range" },
      { id: "paidAt", label: "Paid on", type: "range", inputType: "date" },
    ]}
    rowActions={(p) => (
      <>
        {p.invoiceUrl && (
          <Button asChild size="sm" variant="outline" className="h-8">
            <a href={`/files/invoices/${p.id}`} target="_blank" rel="noopener noreferrer">
              <Receipt className="h-4 w-4" aria-hidden /> Invoice
            </a>
          </Button>
        )}
        {/* a refund happens by cancelling a paid booking that hasn't taken place yet */}
        {p.status === "PAID" && p.appointment?.status === "SCHEDULED" && (
          <ConfirmActionDialog
            trigger="Refund"
            title="Refund this payment?"
            description={`The appointment is cancelled and ${formatTaka(p.amount)} is refunded to ${p.appointment.patient?.name}'s card.`}
            confirmLabel="Cancel & refund"
            destructive
            withReason={{ label: "Reason" }}
            onConfirm={(reason) => adminCancelAppointmentAction(p.appointment.id, reason)}
            invalidate={["admin-payments", "admin-appointments", "admin-dashboard-data"]}
          />
        )}
      </>
    )}
  />
);

export default AdminPaymentsTable;
