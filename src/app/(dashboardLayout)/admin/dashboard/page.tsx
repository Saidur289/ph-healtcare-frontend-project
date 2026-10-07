import AdminDashboardContent from "@/components/modules/Dashboard/AdminDashboardContent";
import DashboardGreeting from "@/components/modules/Dashboard/DashboardGreeting";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { queryKeys } from "@/lib/queryKeys";
import { getUserInfo } from "@/services/auth.service";
import { getDashboardData } from "@/services/dashboard.service";
import { IAdminDashboardData } from "@/types/dashboard.types";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";

const AdminDashboardPage = async () => {
  const queryClient = new QueryClient();
  const [user] = await Promise.all([
    getUserInfo(),
    queryClient.prefetchQuery({
      queryKey: queryKeys.adminDashboard,
      queryFn: () => getDashboardData<IAdminDashboardData>(),
      staleTime: 30 * 1000,
    }),
  ]);

  return (
    <Stagger className="space-y-6">
      <StaggerItem>
        <DashboardGreeting name={user?.name ?? "Admin"} />
      </StaggerItem>
      <StaggerItem>
        <HydrationBoundary state={dehydrate(queryClient)}>
          <AdminDashboardContent />
        </HydrationBoundary>
      </StaggerItem>
    </Stagger>
  );
};

export default AdminDashboardPage;
