import AdminsTable from "@/components/modules/Admin/Admins/AdminsTable";
import AdminPageHeader from "@/components/modules/Admin/shared/AdminPageHeader";
import EmptyState from "@/components/shared/EmptyState";
import { getAdmins } from "@/services/admin.services";
import { getUserInfo } from "@/services/auth.service";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { ShieldAlert } from "lucide-react";

const AdminsManagementPage = async () => {
  const user = await getUserInfo();
  const header = <AdminPageHeader title="Admins" description="Who can manage the platform. Super admins only." />;

  // proxy.ts treats SUPER_ADMIN and ADMIN alike for /admin routes, so check here too (the API checks as well)
  if (user?.role !== "SUPER_ADMIN") {
    return (
      <div className="space-y-5">
        {header}
        <EmptyState icon={ShieldAlert} title="Super admins only" description="Ask a super admin if you need admin accounts changed." />
      </div>
    );
  }

  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({ queryKey: ["admin-admins"], queryFn: () => getAdmins() });
  return (
    <div className="space-y-5">
      {header}
      <HydrationBoundary state={dehydrate(queryClient)}>
        <AdminsTable currentUserId={user.id} />
      </HydrationBoundary>
    </div>
  );
};

export default AdminsManagementPage;
