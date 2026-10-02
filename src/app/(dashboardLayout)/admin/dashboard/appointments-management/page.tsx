import AdminAppointmentsTable from "@/components/modules/Admin/Appointments/AdminAppointmentsTable";
import AdminPageHeader from "@/components/modules/Admin/shared/AdminPageHeader";
import { toQueryString } from "@/lib/searchParams";
import { getAppointmentsForAdmin } from "@/services/admin.services";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";

const AppointmentsManagementPage = async ({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) => {
  const queryString = toQueryString(await searchParams);
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["admin-appointments", queryString],
    queryFn: () => getAppointmentsForAdmin(queryString),
  });

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Appointments"
        description="Every booking on the platform. Cancelling a paid appointment refunds the patient."
      />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <AdminAppointmentsTable initialQueryString={queryString} />
      </HydrationBoundary>
    </div>
  );
};

export default AppointmentsManagementPage;
