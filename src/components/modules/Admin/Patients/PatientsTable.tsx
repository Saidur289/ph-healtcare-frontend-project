"use client";
import { changeUserStatusAction } from "@/app/_actions/admin.actions";
import AdminListTable from "@/components/modules/Admin/shared/AdminListTable";
import ConfirmActionDialog from "@/components/modules/Admin/shared/ConfirmActionDialog";
import UserInfoCell from "@/components/shared/cell/UserInfoCell";
import StatusPill from "@/components/shared/StatusPill";
import { serverManagedFilter } from "@/hooks/useServerManagedDataTableFilters";
import { formatDay } from "@/lib/appointmentUtils";
import { getPatientsForAdmin } from "@/services/admin.services";
import { IAdminPatient } from "@/types/admin.types";
import { ColumnDef } from "@tanstack/react-table";

const columns: ColumnDef<IAdminPatient>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: "Patient",
    cell: ({ row }) => <UserInfoCell name={row.original.name} email={row.original.email} profilePhoto={row.original.profilePhoto} />,
  },
  { id: "contactNumber", header: "Phone", enableSorting: false, cell: ({ row }) => row.original.contactNumber || "—" },
  {
    id: "appointments",
    header: "Appointments",
    enableSorting: false,
    cell: ({ row }) => row.original._count?.appointments ?? 0,
  },
  { id: "createdAt", accessorKey: "createdAt", header: "Joined", cell: ({ row }) => formatDay(row.original.createdAt) },
  {
    id: "status",
    header: "Status",
    enableSorting: false,
    cell: ({ row }) => (
      <span className="flex flex-wrap gap-1">
        <StatusPill status={row.original.user?.status} />
        {!row.original.user?.emailVerified && <StatusPill tone="amber">Email not verified</StatusPill>}
      </span>
    ),
  },
];

const STATUS_KEY = "user.status";

const PatientsTable = ({ initialQueryString }: { initialQueryString: string }) => (
  <AdminListTable<IAdminPatient>
    queryKey="admin-patients"
    fetcher={getPatientsForAdmin}
    initialQueryString={initialQueryString}
    columns={columns}
    searchPlaceholder="Search by name, email or phone…"
    emptyMessage="No patients found."
    filterDefinitions={[serverManagedFilter.single(STATUS_KEY)]}
    filterConfigs={[
      {
        id: STATUS_KEY,
        label: "Status",
        type: "single-select",
        options: [
          { label: "Active", value: "ACTIVE" },
          { label: "Blocked", value: "BLOCKED" },
        ],
      },
    ]}
    rowActions={(patient) =>
      patient.user?.status === "BLOCKED" ? (
        <ConfirmActionDialog
          trigger="Unblock"
          title={`Unblock ${patient.name}?`}
          description="They can log in and book appointments again."
          confirmLabel="Unblock"
          onConfirm={() => changeUserStatusAction(patient.user.id, "ACTIVE")}
          invalidate={["admin-patients"]}
        />
      ) : (
        <ConfirmActionDialog
          trigger="Block"
          title={`Block ${patient.name}?`}
          description="They are signed out everywhere and can't log in until unblocked. Existing appointments are not cancelled."
          confirmLabel="Block"
          destructive
          onConfirm={() => changeUserStatusAction(patient.user.id, "BLOCKED")}
          invalidate={["admin-patients"]}
        />
      )
    }
  />
);

export default PatientsTable;
