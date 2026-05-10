import AdminDashboardContent from "@/components/modules/Dashboard/AdminDashboardContent";
import { getDashboardData } from "@/services/dashboard.service";
import { ApiResponse } from "@/types/api.types";
import { IAdminDashboardData } from "@/types/dashboard.types";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import React from "react";

const AdminDashboardLayoutPage = async () => {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["admin-dashboard-data"],
    queryFn: getDashboardData,
    staleTime: 30 * 1000, // 30 seconds data stays fresh if this data access is less than 30 seconds it will use cached data it will not make request

    gcTime: 5 * 60 * 1000, // 5 minutes garbage collection after this time  remove the cached and make new memory
  });
  const dashboardData = queryClient.getQueryData([
    "admin-dashboard-data",
  ]) as ApiResponse<IAdminDashboardData>;
  console.log(dashboardData.data, "Dashboard data from page components");
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdminDashboardContent />
    </HydrationBoundary>
  );
};

export default AdminDashboardLayoutPage;
