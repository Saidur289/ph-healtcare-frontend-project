import AdminDoctorSchedulesTable from "@/components/modules/Admin/DoctorSchedules/AdminDoctorSchedulesTable";
import AdminPageHeader from "@/components/modules/Admin/shared/AdminPageHeader";
import { toQueryString } from "@/lib/searchParams";
import { getDoctorSchedulesForAdmin } from "@/services/admin.services";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";

const DoctorSchedulesManagementPage = async ({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) => {
  const queryString = toQueryString(await searchParams);
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["admin-doctor-schedules", queryString],
    queryFn: () => getDoctorSchedulesForAdmin(queryString),
  });

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Doctor Schedules"
        description="Which time slots each doctor has opened, and which are booked. Doctors manage their own slots."
      />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <AdminDoctorSchedulesTable initialQueryString={queryString} />
      </HydrationBoundary>
    </div>
  );
};

export default DoctorSchedulesManagementPage;
