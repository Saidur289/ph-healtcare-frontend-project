import DoctorSpecialtiesTable from "@/components/modules/Admin/DoctorSpecialties/DoctorSpecialtiesTable";
import AdminPageHeader from "@/components/modules/Admin/shared/AdminPageHeader";
import { toQueryString } from "@/lib/searchParams";
import { getAllSpecialties, getDoctorsForAdmin } from "@/services/doctor.services";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";

const DoctorSpecialtiesPage = async ({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) => {
  const queryString = toQueryString(await searchParams);
  const queryClient = new QueryClient();
  const [specialties] = await Promise.all([
    getAllSpecialties().catch(() => null),
    queryClient.prefetchQuery({
      queryKey: ["admin-doctor-specialties", queryString],
      queryFn: () => getDoctorsForAdmin(queryString),
    }),
  ]);

  return (
    <div className="space-y-5">
      <AdminPageHeader title="Doctor Specialties" description="Choose which specialties each doctor appears under." />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <DoctorSpecialtiesTable
          initialQueryString={queryString}
          specialtyTitles={(specialties?.data ?? []).map((s) => s.title)}
        />
      </HydrationBoundary>
    </div>
  );
};

export default DoctorSpecialtiesPage;
