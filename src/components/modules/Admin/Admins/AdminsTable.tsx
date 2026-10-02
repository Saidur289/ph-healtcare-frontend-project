"use client";
import { changeUserRoleAction, changeUserStatusAction, deleteAdminAction } from "@/app/_actions/admin.actions";
import ConfirmActionDialog from "@/components/modules/Admin/shared/ConfirmActionDialog";
import UserInfoCell from "@/components/shared/cell/UserInfoCell";
import ErrorState from "@/components/shared/ErrorState";
import StatusPill from "@/components/shared/StatusPill";
import DataTable from "@/components/shared/table/DataTable";
import { formatDay } from "@/lib/appointmentUtils";
import { getAdmins } from "@/services/admin.services";
import { IAdminUser } from "@/types/admin.types";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import AdminFormDialog from "./AdminFormDialog";

const columns: ColumnDef<IAdminUser>[] = [
  {
    id: "name",
    header: "Admin",
    cell: ({ row }) => <UserInfoCell name={row.original.name} email={row.original.email} profilePhoto={row.original.profilePhoto} />,
  },
  {
    id: "role",
    header: "Role",
    cell: ({ row }) =>
      row.original.user?.role === "SUPER_ADMIN" ? <StatusPill tone="teal">Super admin</StatusPill> : <StatusPill tone="blue">Admin</StatusPill>,
  },
  { id: "status", header: "Status", cell: ({ row }) => <StatusPill status={row.original.user?.status} /> },
  { id: "createdAt", header: "Added", cell: ({ row }) => formatDay(row.original.createdAt) },
];

// SUPER_ADMIN only (the page and the API both check). The API refuses changes to yourself.
const AdminsTable = ({ currentUserId }: { currentUserId: string }) => {
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ["admin-admins"], queryFn: () => getAdmins() });
  if (isError) return <ErrorState message="Could not load the admins." onRetry={() => void refetch()} />;

  return (
    <DataTable
      data={data?.data ?? []}
      columns={columns}
      isLoading={isLoading}
      emptyMessage="No admins yet."
      toolbarAction={<AdminFormDialog />}
      rowActions={(admin) => {
        const isSelf = admin.user?.id === currentUserId;
        const isSuper = admin.user?.role === "SUPER_ADMIN";
        if (isSelf) return <span className="text-xs text-muted-foreground">You</span>;
        return (
          <>
            <AdminFormDialog admin={admin} />
            <ConfirmActionDialog
              trigger={isSuper ? "Make admin" : "Make super admin"}
              title={isSuper ? `Make ${admin.name} a regular admin?` : `Make ${admin.name} a super admin?`}
              description={
                isSuper
                  ? "They lose access to admin management."
                  : "Super admins can create, change and remove other admins. Give this only to people you fully trust."
              }
              confirmLabel="Change role"
              onConfirm={() => changeUserRoleAction(admin.user.id, isSuper ? "ADMIN" : "SUPER_ADMIN")}
              invalidate={["admin-admins"]}
            />
            {!isSuper &&
              (admin.user?.status === "BLOCKED" ? (
                <ConfirmActionDialog
                  trigger="Unblock"
                  title={`Unblock ${admin.name}?`}
                  description="They can log in again."
                  confirmLabel="Unblock"
                  onConfirm={() => changeUserStatusAction(admin.user.id, "ACTIVE")}
                  invalidate={["admin-admins"]}
                />
              ) : (
                <ConfirmActionDialog
                  trigger="Block"
                  title={`Block ${admin.name}?`}
                  description="They are signed out everywhere and can't log in until unblocked."
                  confirmLabel="Block"
                  destructive
                  onConfirm={() => changeUserStatusAction(admin.user.id, "BLOCKED")}
                  invalidate={["admin-admins"]}
                />
              ))}
            {!isSuper && (
              <ConfirmActionDialog
                trigger="Remove"
                title={`Remove ${admin.name}?`}
                description="Their admin account is deleted and they are signed out. This can't be undone."
                confirmLabel="Remove admin"
                destructive
                triggerVariant="ghost"
                onConfirm={() => deleteAdminAction(admin.id)}
                invalidate={["admin-admins"]}
              />
            )}
          </>
        );
      }}
    />
  );
};

export default AdminsTable;
