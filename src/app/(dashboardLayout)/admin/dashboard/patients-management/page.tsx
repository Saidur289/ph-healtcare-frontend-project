import PatientsTable from "@/components/modules/Admin/Patients/PatientsTable";
import AdminPageHeader from "@/components/modules/Admin/shared/AdminPageHeader";
import { toQueryString } from "@/lib/searchParams";
import { getPatientsForAdmin } from "@/services/admin.services";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";

const PatientsManagementPage = async ({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) => {
  const queryString = toQueryString(await searchParams);
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["admin-patients", queryString],
    queryFn: () => getPatientsForAdmin(queryString),
  });

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Patients"
        description="Registered patients. Blocking signs a patient out and stops new logins. Medical records are not shown here."
      />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <PatientsTable initialQueryString={queryString} />
      </HydrationBoundary>
    </div>
  );
};

export default PatientsManagementPage;
