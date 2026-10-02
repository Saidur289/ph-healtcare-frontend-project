import AdminPrescriptionsTable from "@/components/modules/Admin/Prescriptions/AdminPrescriptionsTable";
import AdminPageHeader from "@/components/modules/Admin/shared/AdminPageHeader";
import { toQueryString } from "@/lib/searchParams";
import { getPrescriptionsForAdmin } from "@/services/admin.services";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";

const PrescriptionsManagementPage = async ({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) => {
  const queryString = toQueryString(await searchParams);
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["admin-prescriptions", queryString],
    queryFn: () => getPrescriptionsForAdmin(queryString),
  });

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Prescriptions"
        description="Issued prescriptions and whether the PDF reached the patient."
      />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <AdminPrescriptionsTable initialQueryString={queryString} />
      </HydrationBoundary>
    </div>
  );
};

export default PrescriptionsManagementPage;
