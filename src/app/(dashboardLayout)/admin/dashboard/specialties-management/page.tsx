import AdminPageHeader from "@/components/modules/Admin/shared/AdminPageHeader";
import SpecialtiesGrid from "@/components/modules/Admin/Specialties/SpecialtiesGrid";
import { getSpecialtiesForAdmin } from "@/services/admin.services";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";

const SpecialtiesManagementPage = async () => {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({ queryKey: ["admin-specialties"], queryFn: () => getSpecialtiesForAdmin() });
  return (
    <div className="space-y-5">
      <AdminPageHeader title="Specialties" description="Medical specialties patients use to find doctors." />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <SpecialtiesGrid />
      </HydrationBoundary>
    </div>
  );
};

export default SpecialtiesManagementPage;
